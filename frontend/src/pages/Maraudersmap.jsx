import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';

// Import the Zustand store
import useRegistrationStore from '../store/useStore';

// Fix for default marker icon issues with Webpack/Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for the current user (e.g., blue marker)
const currentUserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for other users (e.g., red marker)
const otherUserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const BACKEND_URL = 'http://localhost:5000';

// HARDCODED LOCATION (for testing distinct points)
const HARDCODED_LOCATION_DATA = {
    userId: 'HogwartsCastle',
    latitude: 51.5074,
    longitude: -0.1278,
    name: 'Hogwarts Castle'
};

// Magical sparkle animation component
const MagicalSparkle = ({ delay = 0 }) => (
    <div 
        className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75"
        style={{
            animationDelay: `${delay}ms`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
        }}
    />
);

// Floating footsteps animation
const FloatingFootsteps = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                className="absolute text-amber-600 opacity-30 animate-bounce"
                style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 10}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                }}
            >
                👣
            </div>
        ))}
    </div>
);

// Main MaraudersMap component
function MaraudersMap() {
    const { registeredUser } = useRegistrationStore();
    
    const currentUserId = useCallback(() => {
        if (registeredUser && registeredUser.username) {
            return registeredUser.username;
        } else {
            let storedAnonId = localStorage.getItem('maraudersMapAnonId');
            if (!storedAnonId) {
                storedAnonId = uuidv4();
                localStorage.setItem('maraudersMapAnonId', storedAnonId);
            }
            return storedAnonId;
        }
    }, [registeredUser]);

    const [currentLocation, setCurrentLocation] = useState(null);
    const [otherUsersLocations, setOtherUsersLocations] = useState({});
    const [isMapActive, setIsMapActive] = useState(false);
    const [spellInput, setSpellInput] = useState('');
    const [showSpellModal, setShowSpellModal] = useState(false);
    const [magicalText, setMagicalText] = useState('');

    const socketRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const watchIdRef = useRef(null);
    const isMapActiveRef = useRef(isMapActive);

    useEffect(() => {
        isMapActiveRef.current = isMapActive;
    }, [isMapActive]);

    // Magical typewriter effect
    const typeWriterEffect = (text, callback) => {
        let i = 0;
        setMagicalText('');
        const timer = setInterval(() => {
            if (i < text.length) {
                setMagicalText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                if (callback) setTimeout(callback, 1000);
            }
        }, 50);
    };

    const updateMarker = useCallback((id, lat, lng, name, isCurrentUser = false) => {
        console.log(`[updateMarker] Called for ID: ${id}, Name: ${name}, isCurrentUser: ${isCurrentUser}`);
        if (!mapRef.current) {
            console.warn('[updateMarker] mapRef.current is null, cannot update marker. Map might be deactivated.');
            return;
        }

        const latLng = [lat, lng];
        const markerKey = `user-${id}`;

        let marker = markersRef.current[markerKey];

        const icon = isCurrentUser ? currentUserIcon : otherUserIcon;

        if (marker) {
            marker.setLatLng(latLng);
            marker.setPopupContent(`<b>${name}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            if (marker.options.icon !== icon) {
                marker.setIcon(icon);
            }
            console.log(`[updateMarker] Updated existing marker for ${id}`);
        } else {
            const newMarker = L.marker(latLng, { icon }).addTo(mapRef.current)
                .bindPopup(`<b>${name}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            markersRef.current[markerKey] = newMarker;
            console.log(`[updateMarker] Created NEW marker for ${id} with icon: ${isCurrentUser ? 'Current User (Blue)' : 'Other User (Red)'}`);
        }
    }, []);

    const removeMarker = useCallback((id) => {
        console.log(`[removeMarker] Attempting to remove marker for ID: ${id}`);
        if (!mapRef.current) {
            console.warn('[removeMarker] mapRef.current is null, cannot remove marker. Map might be deactivated.');
            return;
        }

        const markerKey = `user-${id}`;
        if (markersRef.current[markerKey]) {
            mapRef.current.removeLayer(markersRef.current[markerKey]);
            delete markersRef.current[markerKey];
            console.log(`[removeMarker] Removed marker for ID: ${id}`);
        } else {
            console.log(`[removeMarker] No marker found for ID: ${id}`);
        }
    }, []);

    // Socket.IO effect (unchanged logic)
    useEffect(() => {
        const currentId = currentUserId();

        if (!currentId) {
            console.log('[Socket] Waiting for currentId (username or anonymous UUID) to be available to connect to Socket.IO.');
            return;
        }

        socketRef.current = io(BACKEND_URL);

        socketRef.current.on('connect', () => {
            console.log('[Socket] Connected to WebSocket server');
            socketRef.current.emit('registerUser', { userId: currentId, name: registeredUser?.username });
            console.log(`[Socket] Emitted 'registerUser' for ${currentId}`);
        });

        socketRef.current.on('locationUpdate', (data) => {
            console.log('[Socket] Received locationUpdate:', data);
            if (isMapActiveRef.current && data.userId !== currentId) {
                setOtherUsersLocations(prevLocations => {
                    const newLocations = { ...prevLocations, [data.userId]: data };
                    const userName = data.name || `User ${data.userId.substring(0, 8)}`;
                    updateMarker(data.userId, data.latitude, data.longitude, userName, false);
                    return newLocations;
                });
            } else if (data.userId === currentId) {
                console.log('[Socket] Received own location update, ignored for otherUsersLocations.');
            } else {
                console.log('[Socket] Map not active, ignoring locationUpdate for other user.');
            }
        });

        socketRef.current.on('userLeft', (data) => {
            const disconnectedUserId = data.userId;
            console.log(`[Socket] User disconnected: ${disconnectedUserId}`);
            if (disconnectedUserId !== currentId) {
                setOtherUsersLocations(prevLocations => {
                    const newLocations = { ...prevLocations };
                    delete newLocations[disconnectedUserId];
                    return newLocations;
                });
                if (isMapActiveRef.current) {
                    removeMarker(disconnectedUserId);
                } else {
                    console.log(`[Socket] Map not active, skipping marker removal for ${disconnectedUserId} as map cleanup handles it.`);
                }
            } else {
                console.log('[Socket] Received own userLeft, ignored.');
            }
        });

        socketRef.current.on('activeUsers', (activeUsersData) => {
            console.log('[Socket] Received activeUsers:', activeUsersData);
            if (isMapActiveRef.current) {
                const filteredUsers = {};
                Object.values(activeUsersData).forEach(user => {
                    if (user.userId !== currentId) {
                        filteredUsers[user.userId] = user;
                        const userName = user.name || `User ${user.userId.substring(0, 8)}`;
                        updateMarker(user.userId, user.latitude, user.longitude, userName, false);
                    } else {
                        const userName = user.name || `You (${user.userId.substring(0, 8)})`;
                        updateMarker(user.userId, user.latitude, user.longitude, userName, true);
                    }
                });
                if (HARDCODED_LOCATION_DATA.userId !== currentId && !filteredUsers[HARDCODED_LOCATION_DATA.userId]) {
                    filteredUsers[HARDCODED_LOCATION_DATA.userId] = HARDCODED_LOCATION_DATA;
                    updateMarker(
                        HARDCODED_LOCATION_DATA.userId,
                        HARDCODED_LOCATION_DATA.latitude,
                        HARDCODED_LOCATION_DATA.longitude,
                        HARDCODED_LOCATION_DATA.name,
                        false
                    );
                    console.log('[Socket] Added hardcoded location to active users.');
                }
                setOtherUsersLocations(filteredUsers);
                console.log('[Socket] Updated otherUsersLocations with filtered data and hardcoded location.');
            }
        });

        socketRef.current.on('mapActivationStatus', (status) => {
            console.log(`[Socket] Received mapActivationStatus: ${status}`);
            setIsMapActive(status);
            if (status) {
                console.log("Marauder's Map is now active!");
                typeWriterEffect("The map reveals its secrets...", () => {
                    if (socketRef.current) {
                        console.log("[Socket] Emitting 'requestActiveUsers' for initial sync.");
                        socketRef.current.emit('requestActiveUsers', { userId: currentId });
                    }
                });
            } else {
                console.log("Marauder's Map is deactivated.");
                typeWriterEffect("Mischief managed. The secrets fade away...");
                setOtherUsersLocations({});
            }
        });

        return () => {
            console.log('[Socket] Disconnecting from WebSocket server.');
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [currentUserId, updateMarker, removeMarker, registeredUser]);

    // Map initialization effect (unchanged logic)
    useEffect(() => {
        if (isMapActive) {
            if (mapRef.current === null && document.getElementById('map')) {
                console.log('[Map Init] Initializing new Leaflet map.');
                mapRef.current = L.map('map').setView([51.505, -0.1278], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapRef.current);
            }

            if (mapRef.current) {
                setTimeout(() => {
                    console.log('[Map Init] Invalidating map size.');
                    mapRef.current.invalidateSize();
                    if (currentLocation) {
                        console.log(`[Map Init] Setting view to current location: ${currentLocation.latitude}, ${currentLocation.longitude}`);
                        mapRef.current.setView([currentLocation.latitude, currentLocation.longitude], 13);
                    } else {
                        console.log('[Map Init] Current location not available, setting view to hardcoded location.');
                        mapRef.current.setView([HARDCODED_LOCATION_DATA.latitude, HARDCODED_LOCATION_DATA.longitude], 13);
                    }
                }, 0);
            }
        } else {
            if (mapRef.current) {
                console.log('[Map Cleanup] Removing Leaflet map instance and all its layers.');
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current = {};
            }
        }
    }, [isMapActive, currentLocation]);

    const handleGeolocationUpdate = useCallback((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[Geolocation] Received update: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        setCurrentLocation({ latitude, longitude });

        const currentId = currentUserId();

        if (socketRef.current && isMapActiveRef.current && currentId) {
            socketRef.current.emit('sendLocation', {
                userId: currentId,
                latitude: latitude,
                longitude: longitude,
                name: registeredUser?.username
            });
            console.log(`[Geolocation] Emitted 'sendLocation' for ${currentId}. Map Active: ${isMapActiveRef.current}`);
        } else {
            console.log(`[Geolocation] Not emitting 'sendLocation'. Socket: ${socketRef.current ? 'Connected' : 'Disconnected'}, Map Active: ${isMapActiveRef.current}, currentId: ${currentId}`);
        }
        if (isMapActiveRef.current && currentId) {
            updateMarker(currentId, latitude, longitude, `You (${registeredUser?.username || currentId.substring(0, 8)})`, true);
        } else {
            console.log('[Geolocation] Map not active or currentId not available, skipping update of current user marker.');
        }
    }, [currentUserId, updateMarker, registeredUser]);

    // Geolocation watch effect (unchanged logic)
    useEffect(() => {
        const currentId = currentUserId();

        if (isMapActive && currentId) {
            if (!watchIdRef.current && navigator.geolocation) {
                console.log('[Geolocation Watch] Starting position watch.');
                watchIdRef.current = navigator.geolocation.watchPosition(
                    handleGeolocationUpdate,
                    (error) => {
                        console.error('[Geolocation Watch] Geolocation error:', error);
                        alert(`Geolocation error: ${error.message}. Please enable location services and ensure permission is granted.`);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        } else {
            if (watchIdRef.current) {
                console.log('[Geolocation Watch] Clearing position watch.');
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setCurrentLocation(null);
            console.log('[Geolocation Watch] Current location state cleared.');
            if (currentId) {
                removeMarker(currentId);
            }
        }
    }, [isMapActive, handleGeolocationUpdate, currentUserId, removeMarker]);

    const handleActivateMap = () => {
        if (!registeredUser || !registeredUser.username) {
            typeWriterEffect("A magical barrier prevents access. You must be properly identified to proceed...");
            setTimeout(() => {
                alert("You must be logged in to activate the Marauder's Map!");
            }, 2000);
            return;
        }
        setShowSpellModal(true);
        console.log('[UI] Activate Map button clicked, showing modal.');
    };

    const handleSpellSubmit = () => {
        const activationSpell = "i solemnly swear i am up to no good";
        const currentId = currentUserId();

        if (spellInput.toLowerCase().trim() === activationSpell.toLowerCase()) {
            if (socketRef.current && currentId) {
                socketRef.current.emit('activateMap', { userId: currentId });
                console.log(`[UI] Emitted 'activateMap' for ${currentId}.`);
                typeWriterEffect("✨ The ancient magic awakens... ✨");
                setTimeout(() => {
                    alert("Mischief Managed! The Marauder's Map is now active.");
                }, 1500);
            }
            setShowSpellModal(false);
            setSpellInput('');
        } else {
            typeWriterEffect("The words shimmer and fade... Try again, young wizard.");
            setTimeout(() => {
                alert("Incorrect spell. The magic requires precise incantation!");
            }, 2000);
            console.warn('[UI] Incorrect spell entered.');
        }
    };

    const handleMischiefManaged = () => {
        const currentId = currentUserId();

        if (socketRef.current && currentId) {
            socketRef.current.emit('deactivateMap', { userId: currentId });
            console.log(`[UI] Emitted 'deactivateMap' for ${currentId}.`);
            typeWriterEffect("The parchment returns to its blank state...");
            setTimeout(() => {
                alert("Map deactivated. Mischief managed.");
            }, 1500);
        }
    };

    const displayUserName = registeredUser?.username || (currentUserId() ? currentUserId().substring(0, 8) : 'Stranger');

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        }}>
            {/* Animated background stars */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Floating magical sparkles */}
            {isMapActive && (
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <MagicalSparkle key={i} delay={i * 200} />
                    ))}
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center p-4">
                {/* Parchment-style container */}
                <div className="relative bg-amber-50 p-8 rounded-lg shadow-2xl w-full max-w-6xl text-center transform transition-all duration-500 hover:scale-[1.02]" 
                     style={{
                         backgroundImage: `
                             radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
                             linear-gradient(45deg, transparent 49%, rgba(139, 69, 19, 0.05) 50%, transparent 51%),
                             url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.08'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                         `,
                         border: '3px solid #8B4513',
                         boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.2), 0 0 40px rgba(0, 0, 0, 0.5)'
                     }}>
                    
                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-amber-800 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-amber-800 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-amber-800 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-amber-800 rounded-br-lg"></div>

                    {/* Floating footsteps when map is active */}
                    {isMapActive && <FloatingFootsteps />}

                    {/* Title with magical styling */}
                    <div className="relative mb-8">
                        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 mb-2 tracking-wider" 
                            style={{ 
                                fontFamily: 'serif',
                                textShadow: '2px 2px 4px rgba(139, 69, 19, 0.3)',
                                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))'
                            }}>
                            The Marauder's Map
                        </h1>
                        <div className="absolute -top-4 -left-4 text-2xl animate-bounce">✨</div>
                        <div className="absolute -top-2 -right-6 text-xl animate-pulse">🪄</div>
                        <p className="text-lg italic text-amber-800 font-serif tracking-wide">
                            "Messrs. Moony, Wormtail, Padfoot, and Prongs are proud to present..."
                        </p>
                    </div>

                    {/* Magical greeting */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-300 shadow-inner">
                        <p className="text-2xl text-amber-900 font-serif">
                            <span className="inline-block animate-pulse">🎭</span>
                            {' '}Welcome, <span className="font-bold text-amber-800">{displayUserName}</span>
                            {' '}<span className="inline-block animate-pulse">🎭</span>
                        </p>
                        {magicalText && (
                            <div className="mt-4 p-3 bg-amber-200 rounded border border-amber-400">
                                <p className="text-amber-900 font-serif italic">{magicalText}</p>
                            </div>
                        )}
                    </div>

                    {/* Magical buttons */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-center gap-6">
                        {!isMapActive ? (
                            <button
                                onClick={handleActivateMap}
                                className="relative px-8 py-4 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-900 text-yellow-100 font-bold rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group overflow-hidden"
                                style={{
                                    boxShadow: '0 0 30px rgba(147, 51, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                }}
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-400/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                                <span className="relative flex items-center gap-2">
                                    🪄 Reveal the Map's Secrets
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={handleMischiefManaged}
                                className="relative px-8 py-4 bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-yellow-100 font-bold rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group overflow-hidden"
                                style={{
                                    boxShadow: '0 0 30px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                }}
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                                <span className="relative flex items-center gap-2">
                                    📜 Mischief Managed
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Spell modal with Harry Potter styling */}
                    {showSpellModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                            <div className="relative bg-amber-50 p-10 rounded-lg shadow-2xl text-center max-w-md w-full mx-4 transform animate-pulse"
                                 style={{
                                     backgroundImage: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                                     border: '3px solid #8B4513',
                                     boxShadow: '0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(139, 69, 19, 0.2)'
                                 }}>
                                
                                {/* Magical sparkles around modal */}
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                                        style={{
                                            left: `${10 + Math.random() * 80}%`,
                                            top: `${10 + Math.random() * 80}%`,
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    />
                                ))}

                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold text-amber-900 mb-6 font-serif">
                                        🔮 The Ancient Incantation 🔮
                                    </h2>
                                    <p className="text-amber-800 mb-6 italic">
                                        "Speak the words that unlock the map's power..."
                                    </p>
                                    <input
                                        type="text"
                                        value={spellInput}
                                        onChange={(e) => setSpellInput(e.target.value)}
                                        placeholder="Whisper the magical words..."
                                        className="w-full p-4 border-2 border-amber-400 rounded-lg mb-6 text-center font-serif text-lg bg-amber-100 focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition-all duration-300"
                                        style={{
                                            boxShadow: 'inset 0 2px 4px rgba(139, 69, 19, 0.2)'
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSpellSubmit()}
                                    />
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={handleSpellSubmit}
                                            className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                            style={{
                                                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                            }}
                                        >
                                            ⚡ Cast Spell
                                        </button>
                                        <button
                                            onClick={() => setShowSpellModal(false)}
                                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                            style={{
                                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Magical map container */}
                    <div className="relative">
                        <div
                            id="map"
                            className={`w-full h-96 rounded-lg shadow-2xl mb-6 transition-all duration-500 ${
                                isMapActive ? 'block transform scale-100 opacity-100' : 'hidden'
                            }`}
                            style={{
                                border: '4px solid #8B4513',
                                boxShadow: isMapActive 
                                    ? '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(139, 69, 19, 0.3)'
                                    : 'none'
                            }}
                        >
                            {!currentLocation && isMapActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-amber-100 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4 animate-spin">🧭</div>
                                        <p className="text-amber-800 font-serif text-lg">
                                            The map is consulting the stars for your location...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Decorative map corners when active */}
                        {isMapActive && (
                            <>
                                <div className="absolute -top-2 -left-2 text-2xl animate-bounce">🗺️</div>
                                <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>🏰</div>
                                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{animationDelay: '1s'}}>🌟</div>
                                <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce" style={{animationDelay: '1.5s'}}>🔮</div>
                            </>
                        )}
                    </div>

                    {/* Location information with magical styling */}
                    {isMapActive && (
                        <div className="mt-8 space-y-6">
                            {/* Current location display */}
                            <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-300 shadow-lg">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="text-2xl">📍</span>
                                    <h3 className="text-xl font-bold text-blue-900 font-serif">Your Magical Coordinates</h3>
                                    <span className="text-2xl">📍</span>
                                </div>
                                <p className="text-blue-800 font-mono text-lg">
                                    {currentLocation 
                                        ? `Latitude: ${currentLocation.latitude.toFixed(6)} | Longitude: ${currentLocation.longitude.toFixed(6)}` 
                                        : 'Divining your position in the magical realm...'}
                                </p>
                            </div>

                            {/* Other users section */}
                            <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300 shadow-lg">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="text-2xl">👥</span>
                                    <h3 className="text-2xl font-bold text-purple-900 font-serif">Fellow Marauders</h3>
                                    <span className="text-2xl">👥</span>
                                </div>
                                
                                {Object.keys(otherUsersLocations).length === 0 ? (
                                    <div className="text-center p-4">
                                        <div className="text-4xl mb-3">🌙</div>
                                        <p className="text-purple-700 font-serif italic text-lg">
                                            The corridors are empty... No other souls wander these magical halls at this moment.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.values(otherUsersLocations).map(user => (
                                            <div 
                                                key={user.userId} 
                                                className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">
                                                        {user.userId === 'HogwartsCastle' ? '🏰' : '🧙‍♂️'}
                                                    </span>
                                                    <span className="font-bold text-purple-800 text-lg">
                                                        {user.name || `Mysterious Wizard ${user.userId.substring(0, 8)}`}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-purple-600 font-mono">
                                                        {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                                                    </div>
                                                    <div className="text-xs text-purple-500 italic">
                                                        {user.userId === 'HogwartsCastle' ? 'Ancient Castle' : 'Wandering Soul'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Magical footer */}
                            <div className="text-center p-4 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-lg border border-amber-400">
                                <p className="text-amber-900 font-serif italic text-sm">
                                    "The map never lies... but it doesn't always tell the whole truth."
                                </p>
                                <div className="flex justify-center gap-2 mt-2">
                                    <span className="text-lg animate-pulse">✨</span>
                                    <span className="text-lg animate-pulse" style={{animationDelay: '0.5s'}}>🪄</span>
                                    <span className="text-lg animate-pulse" style={{animationDelay: '1s'}}>✨</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inactive state message */}
                    {!isMapActive && (
                        <div className="text-center p-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg border-2 border-gray-400 shadow-inner">
                            <div className="text-6xl mb-4 opacity-50">📜</div>
                            <p className="text-gray-700 font-serif text-xl italic">
                                The parchment appears blank to untrained eyes...
                            </p>
                            <p className="text-gray-600 font-serif text-sm mt-2">
                                Speak the ancient words to reveal its secrets
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating magical elements */}
            <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none">
                <div className="text-2xl animate-bounce opacity-70">🦉</div>
                <div className="text-xl animate-pulse opacity-70">📚</div>
                <div className="text-lg animate-spin opacity-70" style={{animationDuration: '3s'}}>⭐</div>
            </div>

            {/* Custom CSS for additional animations */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                
                .animate-twinkle {
                    animation: twinkle var(--duration) ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(2deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #8B4513;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #A0522D;
                }
            `}</style>
        </div>
    );
}

export default MaraudersMap;