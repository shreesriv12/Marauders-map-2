// src/components/common/SketchfabViewer.jsx

import React, { useEffect, useRef, useState } from 'react';

// URL for the Sketchfab Viewer API script. It's a static URL provided by Sketchfab.
const SKETCHFAB_API_SCRIPT_URL = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";

/**
 * A React component to embed and control Sketchfab 3D models using their Viewer API.
 *
 * @param {object} props - The component's props.
 * @param {string} props.uid - The unique ID of the Sketchfab model to display.
 * @param {function} [props.onViewerReady] - Callback function triggered when the viewer and model are fully loaded and ready for interaction.
 * It receives the Sketchfab API object as an argument.
 * @param {string} [props.className] - CSS classes to apply to the iframe element. Useful for Tailwind CSS.
 * @param {object} [props.style] - Inline CSS styles to apply to the iframe element.
 * @param {boolean} [props.hidden=false] - If true, the iframe will initially be rendered with opacity:0 to prevent flash of content,
 * and will become visible when the viewer is ready. This also helps with Firefox issues.
 */
const SketchfabViewer = ({ uid, onViewerReady, className, style, hidden = false }) => {
    // useRef to get a direct reference to the iframe DOM element
    const iframeRef = useRef(null);
    // useRef to store the Sketchfab API object received after successful initialization
    const apiRef = useRef(null);
    // State to track if the Sketchfab API script has been loaded into the DOM
    const [scriptLoaded, setScriptLoaded] = useState(false);
    // State to track if the Sketchfab viewer for the current model has fully initialized and loaded
    const [viewerInitialized, setViewerInitialized] = useState(false);

    // Effect hook to dynamically load the Sketchfab API script.
    // It runs once when the component mounts or when 'scriptLoaded' changes if the script isn't loaded yet.
    useEffect(() => {
        // Prevent re-loading the script if it's already loaded
        if (scriptLoaded) return;

        // Check if the script tag already exists in the document head
        const existingScript = document.getElementById('sketchfab-api-script');
        if (existingScript) {
            setScriptLoaded(true); // Mark as loaded if already present
            return;
        }

        // Create a new script element
        const script = document.createElement('script');
        script.id = 'sketchfab-api-script'; // Assign a unique ID for easy lookup
        script.src = SKETCHFAB_API_SCRIPT_URL;
        script.async = true; // Load script asynchronously

        // Set up event listeners for script loading
        script.onload = () => {
            console.log("Sketchfab Viewer API script loaded successfully.");
            setScriptLoaded(true);
        };
        script.onerror = () => {
            console.error("Failed to load Sketchfab Viewer API script.");
        };

        // Append the script to the document's head
        document.head.appendChild(script);

        // Optional cleanup function: not strictly necessary for global scripts,
        // but good practice if you were managing multiple dynamic scripts.
        return () => {
            // No specific cleanup for this global script as it's typically used throughout the app lifecycle.
        };
    }, [scriptLoaded]); // Dependency array: re-run if scriptLoaded state changes

    // Effect hook to initialize the Sketchfab viewer within the iframe.
    // This runs when the script is loaded, the iframe reference is available, or the UID changes.
    useEffect(() => {
        // Do not proceed if script isn't loaded, iframe isn't mounted, or viewer is already initialized for this UID
        if (!scriptLoaded || !iframeRef.current || viewerInitialized) {
            return;
        }

        // Ensure the global Sketchfab object is available before attempting to use it
        if (typeof window.Sketchfab === 'undefined') {
            console.warn("Sketchfab API script not globally available yet, retrying initialization...");
            // You might want to add a small delay and retry here if this happens often
            return;
        }

        console.log(`Initializing Sketchfab Viewer for UID: ${uid}`);
        // Create a new Sketchfab client instance, passing the iframe element
        const client = new window.Sketchfab(iframeRef.current);

        // Initialize the viewer with the given UID and configuration options
        client.init(uid, {
            success: function onSuccess(api) {
                apiRef.current = api; // Store the API object in the ref for external control
                api.start(); // Start rendering the 3D model

                // Add an event listener for when the viewer is fully ready (model loaded, interactive)
                api.addEventListener('viewerready', function() {
                    console.log(`Sketchfab Viewer for UID ${uid} is ready.`);
                    setViewerInitialized(true); // Mark viewer as initialized
                    if (onViewerReady) {
                        onViewerReady(api); // Call the provided callback with the API object
                    }
                });
            },
            error: function onError(err) {
                console.error(`Sketchfab Viewer error for UID ${uid}:`, err);
                // Optionally handle error state in parent component
            },
            autostart: 1, // Automatically start the model's animation/playback
            // You can add more Sketchfab API initialization options here:
            // ui_controls: 0, // Hide viewer controls
            // ui_infos: 0,    // Hide model info (title, author)
            // camera: [x, y, z], // Set initial camera position
            // See Sketchfab API documentation for full list of options
            // https://sketchfab.com/developers/viewer_api/docs/initialization
        });

        // Cleanup function for when the component (or the UID) changes or unmounts.
        // This helps prevent memory leaks and ensures clean transitions between models.
        return () => {
            if (apiRef.current) {
                // If the viewer was initialized, stop it to free resources.
                // Note: The iframe itself is handled by React's unmounting.
                try {
                    apiRef.current.stop(); // Stops playback
                    // apiRef.current.destroy(); // In some scenarios, you might want to fully destroy,
                    // but often stopping is enough if the iframe remains in DOM for a new model.
                } catch (e) {
                    console.warn(`Error stopping Sketchfab API for UID ${uid}:`, e);
                }
                apiRef.current = null; // Clear the API reference
            }
            setViewerInitialized(false); // Reset initialization state
        };
    }, [scriptLoaded, uid, onViewerReady]); // Dependencies: re-run if these props/states change

    // Construct the className for the iframe, handling the 'hidden' prop
    const iframeClasses = `
        ${className || ''}
        ${hidden || !viewerInitialized ? 'opacity-0 absolute pointer-events-none' : ''}
        ${hidden ? 'h-0 w-0' : ''}
    `.trim();

    return (
        <iframe
            ref={iframeRef}
            id={`sketchfab-api-frame-${uid}`}
            src=""
            className={iframeClasses}
            style={style}
            // --- IMPORTANT CHANGE HERE ---
            allow="autoplay; fullscreen; xr-spatial-tracking; execution-while-out-of-viewport; execution-while-not-rendered; web-share; accelerometer; gyroscope; magnetometer;"
            // --- END IMPORTANT CHANGE ---
            allowFullScreen
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
    );
};