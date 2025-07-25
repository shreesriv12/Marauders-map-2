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
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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
    // --- Initial state from Zustand ---
    const { registeredUser, token: zustandToken } = useRegistrationStore();

    // Create refs to hold the latest values of registeredUser and zustandToken
    const registeredUserRef = useRef(registeredUser);
    const zustandTokenRef = useRef(zustandToken);

    // Update refs whenever registeredUser or zustandToken changes
    useEffect(() => {
        registeredUserRef.current = registeredUser;
        zustandTokenRef.current = zustandToken;
        console.log("[DEBUG MaraudersMap] registeredUserRef updated:", registeredUserRef.current);
        console.log("[DEBUG MaraudersMap] zustandTokenRef updated:", zustandTokenRef.current ? "PRESENT" : "ABSENT");
    }, [registeredUser, zustandToken]);


    // --- DEBUGGING: Initial render (will show initial value then subsequent updates from ref) ---
    console.log("[DEBUG MaraudersMap] Initial render - registeredUser:", registeredUser);
    console.log("[DEBUG MaraudersMap] Initial render - Zustand Token:", zustandToken ? "PRESENT" : "ABSENT");


    const currentUserId = useCallback(() => {
        // Use the ref for the most up-to-date registeredUser
        if (registeredUserRef.current && registeredUserRef.current.username) {
            return registeredUserRef.current.username;
        } else {
            let storedAnonId = localStorage.getItem('maraudersMapAnonId');
            if (!storedAnonId) {
                storedAnonId = uuidv4();
                localStorage.setItem('maraudersMapAnonId', storedAnonId);
            }
            return storedAnonId;
        }
    }, []); // Removed registeredUser from dependency as we use ref

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
        console.log(`[DEBUG MaraudersMap] isMapActive state changed to: ${isMapActive}`);
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
        console.log(`[updateMarker] Called for ID: ${id}, Name: ${name}, isCurrentUser: ${isCurrentUser}. mapRef.current: ${!!mapRef.current}`);
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
        console.log(`[removeMarker] Attempting to remove marker for ID: ${id}. mapRef.current: ${!!mapRef.current}`);
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

    // Socket.IO effect
    useEffect(() => {
        // Access current values using refs
        const currentId = currentUserId(); // currentUserId already uses the ref
        const token = zustandTokenRef.current; // Use the ref for token

        console.log(`[DEBUG Socket.IO Effect] Running. currentId: ${currentId}, token: ${token ? 'PRESENT' : 'ABSENT'}`);

        if (!currentId || !token) {
            console.log('[Socket] Waiting for currentId and token to be available to connect to Socket.IO. Current state: ', { currentId, token: token ? 'PRESENT' : 'ABSENT' });
            return;
        }

        // Initialize socket with authentication token
        socketRef.current = io(BACKEND_URL, {
            auth: {
                token: token
            }
        });

        socketRef.current.on('connect', () => {
            console.log('[Socket] Connected to WebSocket server');
            // Use registeredUserRef.current for sending the username
            socketRef.current.emit('registerUser', { userId: currentId, name: registeredUserRef.current?.username });
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
                // Clear all existing markers first before re-adding
                Object.values(markersRef.current).forEach(marker => {
                    if (mapRef.current) mapRef.current.removeLayer(marker);
                });
                markersRef.current = {}; // Reset the ref

                const filteredUsers = {};
                // Add current user's marker if location is known
                if (currentLocation) {
                    const userName = registeredUserRef.current?.username || `You (${currentId.substring(0, 8)})`;
                    updateMarker(currentId, currentLocation.latitude, currentLocation.longitude, userName, true);
                }

                // Add other active users' markers
                Object.values(activeUsersData).forEach(user => {
                    if (user.userId !== currentId) {
                        filteredUsers[user.userId] = user;
                        const userName = user.name || `User ${user.userId.substring(0, 8)}`;
                        updateMarker(user.userId, user.latitude, user.longitude, userName, false);
                    }
                });

                // Add hardcoded location if not the current user and not already in activeUsers
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

        // Dependencies: Only include variables that, if changed, require re-running the effect.
        // We're now relying on refs for registeredUser and zustandToken inside the event handlers.
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
    }, [currentUserId, updateMarker, removeMarker, currentLocation]); // Removed registeredUser and zustandToken

    // Map initialization effect
    useEffect(() => {
        console.log(`[DEBUG Map Init Effect] Running. isMapActive: ${isMapActive}, mapRef.current: ${!!mapRef.current}`);
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
                markersRef.current = {}; // Ensure markers are cleared
                console.log('[Map Cleanup] Cleared markersRef.current');
            }
        }
    }, [isMapActive, currentLocation]);

    const handleGeolocationUpdate = useCallback((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[Geolocation] Received update: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}. isMapActiveRef.current: ${isMapActiveRef.current}`);
        setCurrentLocation({ latitude, longitude });

        const currentId = currentUserId();

        if (socketRef.current && isMapActiveRef.current && currentId) {
            // Use registeredUserRef.current for sending the username
            socketRef.current.emit('sendLocation', {
                userId: currentId,
                latitude: latitude,
                longitude: longitude,
                name: registeredUserRef.current?.username
            });
            console.log(`[Geolocation] Emitted 'sendLocation' for ${currentId}. Map Active: ${isMapActiveRef.current}`);
        } else {
            console.log(`[Geolocation] Not emitting 'sendLocation'. Socket: ${socketRef.current ? 'Connected' : 'Disconnected'}, Map Active: ${isMapActiveRef.current}, currentId: ${currentId}`);
        }
        if (isMapActiveRef.current && currentId) {
            // Use registeredUserRef.current for the display name
            updateMarker(currentId, latitude, longitude, `You (${registeredUserRef.current?.username || currentId.substring(0, 8)})`, true);
        } else {
            console.log('[Geolocation] Map not active or currentId not available, skipping update of current user marker.');
        }
    }, [currentUserId, updateMarker]); // Removed registeredUser

    // Geolocation watch effect
    useEffect(() => {
        const currentId = currentUserId();
        console.log(`[DEBUG Geolocation Effect] Running. isMapActive: ${isMapActive}, currentId: ${currentId}. watchIdRef.current: ${!!watchIdRef.current}`);

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
            } else if (watchIdRef.current) {
                console.log('[Geolocation Watch] Watch already active, no new watch started.');
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
                console.log(`[Geolocation Watch Cleanup] Attempting to remove current user marker (${currentId})`);
                removeMarker(currentId);
            }
        }
    }, [isMapActive, handleGeolocationUpdate, currentUserId, removeMarker]);

    const handleActivateMap = () => {
        console.log("[DEBUG handleActivateMap] Called.");
        // Access current values using refs
        const currentUser = registeredUserRef.current;
        const currentToken = zustandTokenRef.current;

        console.log("[DEBUG handleActivateMap] currentUser (from ref):", currentUser);
        console.log("[DEBUG handleActivateMap] currentUser.username (from ref):", currentUser?.username);
        console.log("[DEBUG handleActivateMap] currentToken (from ref):", currentToken ? "PRESENT" : "ABSENT");

        if (!currentUser || !currentUser.username || !currentToken) { // Use ref values here
            console.warn("[DEBUG handleActivateMap] Activation prevented: User is NOT considered logged in.");
            typeWriterEffect("A magical barrier prevents access. You must be properly identified to proceed...");
            setTimeout(() => {
                alert("You must be logged in to activate the Marauder's Map!");
            }, 2000);
            return;
        }
        console.log("[DEBUG handleActivateMap] User IS considered logged in. Proceeding to show spell modal.");
        setShowSpellModal(true);
        console.log('[UI] Activate Map button clicked, showing modal.');
    };

    const handleSpellSubmit = () => {
        const activationSpell = "i solemnly swear i am up to no good";
        const currentId = currentUserId(); // This already uses the ref

        console.log("[DEBUG handleSpellSubmit] Spell input:", spellInput.toLowerCase().trim());
        console.log("[DEBUG handleSpellSubmit] Expected spell:", activationSpell.toLowerCase());

        if (spellInput.toLowerCase().trim() === activationSpell.toLowerCase()) {
            if (socketRef.current && currentId) {
                socketRef.current.emit('activateMap', { userId: currentId });
                console.log(`[UI] Emitted 'activateMap' for ${currentId}.`);
                typeWriterEffect("✨ The ancient magic awakens... ✨");
                setTimeout(() => {
                    alert("Mischief Managed! The Marauder's Map is now active.");
                }, 1500);
            } else {
                 console.warn("[DEBUG handleSpellSubmit] Could not emit 'activateMap'. Socket:", !!socketRef.current, "currentId:", currentId);
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
        const currentId = currentUserId(); // This already uses the ref
        console.log("[DEBUG handleMischiefManaged] Called.");

        if (socketRef.current && currentId) {
            socketRef.current.emit('deactivateMap', { userId: currentId });
            console.log(`[UI] Emitted 'deactivateMap' for ${currentId}.`);
            typeWriterEffect("The parchment returns to its blank state...");
            setTimeout(() => {
                alert("Map deactivated. Mischief managed.");
            }, 1500);
        } else {
             console.warn("[DEBUG handleMischiefManaged] Could not emit 'deactivateMap'. Socket:", !!socketRef.current, "currentId:", currentId);
        }
    };

    // Use registeredUserRef.current for the display name for consistency
    const displayUserName = registeredUserRef.current?.username || (currentUserId() ? currentUserId().substring(0, 8) : 'Stranger');
    console.log("[DEBUG MaraudersMap] Displaying username:", displayUserName);


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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaraudersMap;