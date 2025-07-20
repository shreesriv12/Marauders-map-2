import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { v4 as uuidv4 } from 'uuid'; // For generating unique user IDs

// Fix for default marker icon issues with Webpack/Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for the current user (e.g., blue marker)
const currentUserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', // Blue marker
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for other users (e.g., red marker)
const otherUserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', // Red marker
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Define the backend URL. If running locally, it's usually http://localhost:5000
const BACKEND_URL = 'http://localhost:5000';

// Main MaraudersMap component
function MaraudersMap() {
    // State for user ID
    const [userId, setUserId] = useState('');
    // State for current location
    const [currentLocation, setCurrentLocation] = useState(null);
    // State to store other users' locations (excluding current user)
    const [otherUsersLocations, setOtherUsersLocations] = useState({});
    // State for map activation status
    const [isMapActive, setIsMapActive] = useState(false);
    // State for spell input
    const [spellInput, setSpellInput] = useState('');
    // State for showing the spell modal
    const [showSpellModal, setShowSpellModal] = useState(false);

    // Ref for the Socket.IO instance
    const socketRef = useRef(null);
    // Ref for the Leaflet map instance
    const mapRef = useRef(null);
    // Ref to store Leaflet markers for easy access and removal
    const markersRef = useRef({}); // { 'user-ID': L.markerInstance }
    // Ref for geolocation watch ID
    const watchIdRef = useRef(null);
    // Ref to hold the current value of isMapActive for use in event listeners
    const isMapActiveRef = useRef(isMapActive);

    // Update the ref whenever isMapActive state changes
    useEffect(() => {
        isMapActiveRef.current = isMapActive;
    }, [isMapActive]);

    // Initialize user ID on component mount
    useEffect(() => {
        let storedUserId = localStorage.getItem('maraudersMapUserId');
        if (!storedUserId) {
            storedUserId = uuidv4();
            localStorage.setItem('maraudersMapUserId', storedUserId);
        }
        setUserId(storedUserId);
        console.log(`[Frontend Init] User ID: ${storedUserId}`);
    }, []);

    // Function to update or add a marker on the map
    const updateMarker = useCallback((id, lat, lng, name, isCurrentUser = false) => {
        console.log(`[updateMarker] Called for ID: ${id}, Name: ${name}, isCurrentUser: ${isCurrentUser}`);
        // IMPORTANT: Only update/create markers if the map is initialized
        if (!mapRef.current) {
            console.warn('[updateMarker] mapRef.current is null, cannot update marker. Map might be deactivated.');
            return;
        }

        const latLng = [lat, lng];
        const markerKey = `user-${id}`;

        let marker = markersRef.current[markerKey];

        const icon = isCurrentUser ? currentUserIcon : otherUserIcon;

        if (marker) {
            // Update existing marker's position and popup content
            marker.setLatLng(latLng);
            marker.setPopupContent(`<b>${name}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            // Update marker icon if it changed
            if (marker.options.icon !== icon) {
                marker.setIcon(icon);
            }
            console.log(`[updateMarker] Updated existing marker for ${id}`);
        } else {
            // Create a new marker if it doesn't exist
            const newMarker = L.marker(latLng, { icon }).addTo(mapRef.current)
                .bindPopup(`<b>${name}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            markersRef.current[markerKey] = newMarker;
            console.log(`[updateMarker] Created NEW marker for ${id} with icon: ${isCurrentUser ? 'Current User (Blue)' : 'Other User (Red)'}`);
        }
    }, []);


    // Function to remove a marker from the map
    const removeMarker = useCallback((id) => {
        console.log(`[removeMarker] Attempting to remove marker for ID: ${id}`);
        // IMPORTANT: Only try to remove if map is initialized AND marker exists
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

    // Effect for Socket.IO connection and event handling
    useEffect(() => {
        if (!userId) return;

        // Connect to Socket.IO server
        socketRef.current = io(BACKEND_URL);

        // Event listener for successful connection
        socketRef.current.on('connect', () => {
            console.log('[Socket] Connected to WebSocket server');
            // Emit user ID upon connection
            socketRef.current.emit('registerUser', userId);
            console.log(`[Socket] Emitted 'registerUser' for ${userId}`);
        });

        // Event listener for receiving location updates from other users
        socketRef.current.on('locationUpdate', (data) => {
            console.log('[Socket] Received locationUpdate:', data);
            // Only update if the map is active and the update is not for the current user
            if (isMapActiveRef.current && data.userId !== userId) {
                setOtherUsersLocations(prevLocations => {
                    const newLocations = { ...prevLocations, [data.userId]: data };
                    updateMarker(data.userId, data.latitude, data.longitude, `User ${data.userId.substring(0, 8)}`, false); // false for other users
                    return newLocations;
                });
            } else if (data.userId === userId) {
                console.log('[Socket] Received own location update, ignored for otherUsersLocations.');
            } else {
                console.log('[Socket] Map not active, ignoring locationUpdate for other user.');
            }
        });

        // Event listener for user disconnect
        socketRef.current.on('userDisconnected', (disconnectedUserId) => {
            console.log(`[Socket] User disconnected: ${disconnectedUserId}`);
            if (disconnectedUserId !== userId) { // Only remove if it's not our own user
                setOtherUsersLocations(prevLocations => {
                    const newLocations = { ...prevLocations };
                    delete newLocations[disconnectedUserId];
                    return newLocations;
                });
                // Remove marker from map
                // Only attempt to remove if the map is still active, to prevent errors during full map cleanup
                if (isMapActiveRef.current) {
                    removeMarker(disconnectedUserId);
                } else {
                    console.log(`[Socket] Map not active, skipping marker removal for ${disconnectedUserId} as map cleanup handles it.`);
                }
            } else {
                console.log('[Socket] Received own userDisconnected, ignored.');
            }
        });

        // Event listener for receiving initial active users
        socketRef.current.on('activeUsers', (activeUsersData) => {
            console.log('[Socket] Received activeUsers:', activeUsersData);
            if (isMapActiveRef.current) {
                const filteredUsers = {};
                // Filter out the current user from the list of other users
                Object.values(activeUsersData).forEach(user => {
                    if (user.userId !== userId) {
                        filteredUsers[user.userId] = user;
                        updateMarker(user.userId, user.latitude, user.longitude, `User ${user.userId.substring(0, 8)}`, false);
                    } else {
                        // Ensure your own marker is also updated if it was in the initial list
                        updateMarker(user.userId, user.latitude, user.longitude, `You (${user.userId.substring(0, 8)})`, true);
                    }
                });
                setOtherUsersLocations(filteredUsers);
                console.log('[Socket] Updated otherUsersLocations with filtered data.');
            }
        });

        // Event listener for map activation status from backend
        socketRef.current.on('mapActivationStatus', (status) => {
            console.log(`[Socket] Received mapActivationStatus: ${status}`);
            setIsMapActive(status); // This will correctly update the state
            if (status) {
                console.log("Marauder's Map is now active!");
                if (socketRef.current) {
                    console.log("[Socket] Emitting 'requestActiveUsers' for initial sync.");
                    socketRef.current.emit('requestActiveUsers');
                }
            } else {
                console.log("Marauder's Map is deactivated.");
                setOtherUsersLocations({}); // Clear other users' locations immediately
                // The actual removal of markers from the map will be handled by the map cleanup useEffect
                // when mapRef.current.remove() is called.
                // So, we don't need to manually remove each marker here.
            }
        });

        // Clean up on component unmount
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
    }, [userId, updateMarker, removeMarker]);

    // This useEffect handles map initialization and invalidation based on isMapActive
    useEffect(() => {
        if (isMapActive) {
            // Initialize map if it doesn't exist and the element is ready
            if (mapRef.current === null && document.getElementById('map')) {
                console.log('[Map Init] Initializing new Leaflet map.');
                mapRef.current = L.map('map').setView([51.505, -0.09], 13); // Default view
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapRef.current);
            }

            if (mapRef.current) {
                // Invalidate size after the element is confirmed to be visible
                setTimeout(() => {
                    console.log('[Map Init] Invalidating map size.');
                    mapRef.current.invalidateSize();
                    if (currentLocation) {
                        console.log(`[Map Init] Setting view to current location: ${currentLocation.latitude}, ${currentLocation.longitude}`);
                        mapRef.current.setView([currentLocation.latitude, currentLocation.longitude], 13);
                    } else {
                        console.log('[Map Init] Current location not available, setting view to default.');
                        mapRef.current.setView([51.505, -0.09], 13);
                    }
                }, 0); // Use a small timeout to ensure the DOM has updated
            }
        } else {
            // Cleanup map when it's deactivated
            if (mapRef.current) {
                console.log('[Map Cleanup] Removing Leaflet map instance and all its layers.');
                mapRef.current.remove(); // This automatically removes all markers from the map
                mapRef.current = null;
                // Clear the markersRef AFTER the map has been removed, as the markers are no longer on it
                markersRef.current = {};
            }
        }
    }, [isMapActive, currentLocation]); // Depend on isMapActive and currentLocation

    // Handle geolocation updates
    const handleGeolocationUpdate = useCallback((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[Geolocation] Received update: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        setCurrentLocation({ latitude, longitude });

        // Use the ref to get the current isMapActive value for sending location
        if (socketRef.current && isMapActiveRef.current) {
            // Emit current user's location to the server
            socketRef.current.emit('sendLocation', {
                userId: userId,
                latitude: latitude,
                longitude: longitude
            });
            console.log(`[Geolocation] Emitted 'sendLocation' for ${userId}. Map Active: ${isMapActiveRef.current}`);
        } else {
            console.log(`[Geolocation] Not emitting 'sendLocation'. Socket: ${socketRef.current ? 'Connected' : 'Disconnected'}, Map Active: ${isMapActiveRef.current}`);
        }
        // Update current user's marker on map (only if map is active)
        if (isMapActiveRef.current) {
            updateMarker(userId, latitude, longitude, `You (${userId.substring(0, 8)})`, true); // true for current user
        } else {
            console.log('[Geolocation] Map not active, skipping update of current user marker.');
        }
    }, [userId, updateMarker]);

    // Start/stop watching geolocation based on map activation
    useEffect(() => {
        if (isMapActive) {
            // Start watching position if not already watching
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
            // Clear watch if map is deactivated
            if (watchIdRef.current) {
                console.log('[Geolocation Watch] Clearing position watch.');
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            // When the map is deactivated, the map cleanup useEffect will handle marker removal.
            // We just clear the current location state.
            setCurrentLocation(null);
            console.log('[Geolocation Watch] Current location state cleared.');
        }
    }, [isMapActive, handleGeolocationUpdate, userId, removeMarker]); // removeMarker is still here for clarity but its direct call in this block is gone

    // Handle spell activation
    const handleActivateMap = () => {
        setShowSpellModal(true);
        console.log('[UI] Activate Map button clicked, showing modal.');
    };

    const handleSpellSubmit = () => {
        const activationSpell = "i solemnly swear i am up to no good";
        if (spellInput.toLowerCase().trim() === activationSpell.toLowerCase()) {
            if (socketRef.current) {
                socketRef.current.emit('activateMap', userId);
                console.log(`[UI] Emitted 'activateMap' for ${userId}.`);
                alert("Mischief Managed! The Marauder's Map is now active.");
            }
            setShowSpellModal(false);
            setSpellInput('');
        } else {
            alert("Incorrect spell. Try again!");
            console.warn('[UI] Incorrect spell entered.');
        }
    };

    // Handle "Mischief Managed"
    const handleMischiefManaged = () => {
        if (socketRef.current) {
            socketRef.current.emit('deactivateMap', userId);
            console.log(`[UI] Emitted 'deactivateMap' for ${userId}.`);
            alert("Map deactivated. Mischief managed.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Marauder's Map</h1>
                <p className="text-lg text-gray-600 mb-6">
                    Welcome, {userId ? userId.substring(0, 8) : 'Stranger'}...
                </p>

                <div className="mb-6 flex flex-col sm:flex-row justify-center gap-4">
                    {!isMapActive ? (
                        <button
                            onClick={handleActivateMap}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Activate Map
                        </button>
                    ) : (
                        <button
                            onClick={handleMischiefManaged}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Mischief Managed
                        </button>
                    )}
                </div>

                {showSpellModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                            <h2 className="text-2xl font-semibold mb-4">What's the activation spell?</h2>
                            <input
                                type="text"
                                value={spellInput}
                                onChange={(e) => setSpellInput(e.target.value)}
                                placeholder="Enter the spell here..."
                                className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleSpellSubmit}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow transition duration-300"
                                >
                                    Cast Spell
                                </button>
                                <button
                                    onClick={() => setShowSpellModal(false)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full shadow transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    id="map"
                    className={`w-full h-96 rounded-lg shadow-md mb-4 ${isMapActive ? 'block' : 'hidden'} bg-gray-200 flex items-center justify-center text-gray-500`}
                >
                    {!currentLocation && isMapActive && <p>Fetching your location...</p>}
                </div>

                {isMapActive && (
                    <div className="mt-8">
                        <p className="text-gray-700">
                            Your current location: {currentLocation ? `Lat: ${currentLocation.latitude.toFixed(4)}, Lng: ${currentLocation.longitude.toFixed(4)}` : 'Getting location...'}
                        </p>
                        <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Other Users on Map:</h3>
                        {Object.keys(otherUsersLocations).length === 0 ? (
                            <p className="text-gray-500">No other users are currently active on the map.</p>
                        ) : (
                            <ul className="list-disc list-inside text-left mx-auto max-w-md">
                                {Object.values(otherUsersLocations).map(user => (
                                    <li key={user.userId} className="text-gray-700">
                                        User {user.userId.substring(0, 8)}: Lat: {user.latitude.toFixed(4)}, Lng: {user.longitude.toFixed(4)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MaraudersMap;