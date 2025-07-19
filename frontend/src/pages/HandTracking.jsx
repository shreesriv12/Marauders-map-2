import React, { useRef, useEffect, useState } from 'react';
import { Webcam, HandHelping, Loader2, RefreshCw, Sparkles, Zap } from 'lucide-react';

const HandTrackingPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wandCanvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const cameraInitializedRef = useRef(false); // Ref to hold the latest cameraInitialized state

  const [isProcessing, setIsProcessing] = useState(false);
  const animationFrameId = useRef(null);

  // Magic spell states
  const [activeSpell, setActiveSpell] = useState('fire'); // Initial spell is 'fire'
  // *** DEBUGGING CHANGE START ***
  // Use a ref to store the latest activeSpell value for functions that don't re-render on state change
  const activeSpellRef = useRef(activeSpell);
  // *** DEBUGGING CHANGE END ***
  const [wandTip, setWandTip] = useState({ x: 0, y: 0 });
  const [spellTrail, setSpellTrail] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  const FLASK_BACKEND_URL = 'http://localhost:5001/track_hands';

  // Color spells configuration
  const spells = {
    fire: {
      color: '#FF4500',    // Orange-Red
      secondary: '#FFD700', // Gold/Yellow - This secondary color can be visually dominant!
      name: 'Incendio',
      emoji: '🔥',
      particles: '✨🔥⭐'
    },
    ice: {
      color: '#00BFFF',    // Deep Sky Blue
      secondary: '#ADD8E6', // Light Blue (distinct secondary for contrast)
      name: 'Glacius',
      emoji: '❄️',
      particles: '❄️💎🌟'
    },
    nature: {
      color: '#32CD32',    // Lime Green
      secondary: '#BDFCC9', // Pale Green (distinct secondary for contrast)
      name: 'Herbivicus',
      emoji: '🌿',
      particles: '🍃🌱✨'
    },
    lightning: {
      color: '#9370DB',    // Medium Purple
      secondary: '#DDA0DD', // Plum (distinct secondary for contrast)
      name: 'Fulgur',
      emoji: '⚡',
      particles: '⚡🌟💫'
    },
    shadow: {
      color: '#4B0082',    // Indigo
      secondary: '#C8A2C8', // Thistle (a lighter, cool purple/grey for distinct secondary)
      name: 'Umbra',
      emoji: '🌙',
      particles: '🌙⭐💜'
    }
  };

  /**
   * Initializes webcam access and starts the video stream.
   * Updates loading and error states based on success or failure.
   */
  const getWebcamAccess = async () => {
    console.log("Frontend Debug: Attempting to get webcam access...");
    setLoading(true);
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraInitialized(true); // Update state for UI
          cameraInitializedRef.current = true; // Update ref for latest value access
          setLoading(false);
          console.log("Frontend Debug: Webcam initialized successfully. cameraInitialized state set to TRUE.");
          startSendingFrames(); // Start the animation loop after camera is ready
        };
      } else {
        throw new Error("Webcam not supported by this browser.");
      }
    } catch (err) {
      console.error("Frontend Error: Failed to access webcam:", err);
      setError(`Failed to access webcam: ${err.message}. Please ensure you grant camera permissions.`);
      setLoading(false);
    }
  };

  /**
   * Continuously captures frames from the webcam, sends them to the backend,
   * and processes the received hand landmark data. This function is called
   * within a requestAnimationFrame loop.
   */
  const sendFrameToBackend = async () => {
    // Prevent processing if camera is not initialized or a frame is already being processed
    if (!videoRef.current || !cameraInitializedRef.current || isProcessing) {
      // Always draw wand effects even when not processing frames to maintain responsiveness
      drawWandEffects(); // Still draw effects to ensure visual continuity
      animationFrameId.current = requestAnimationFrame(sendFrameToBackend);
      return;
    }

    setIsProcessing(true); // Set processing flag to prevent concurrent requests

    const video = videoRef.current;
    const canvas = document.createElement('canvas'); // Create a temporary canvas for image data
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame onto the temporary canvas, flipped horizontally
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Get image data as base64 URL

    try {
      const response = await fetch(FLASK_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hand_landmarks && data.hand_landmarks.length > 0) {
          drawHandLandmarks(data.hand_landmarks); // Draw landmarks on the main canvas
          updateWandPosition(data.hand_landmarks[0]); // Update wand tip based on first hand
        } else {
          // Clear canvases if no hands are detected
          const canvasCtx = canvasRef.current.getContext('2d');
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          clearWandEffects();
        }
      } else {
        const errorText = await response.text();
        setError(`Backend processing error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      setError(`Network error: Could not connect to backend. Is Flask server running at ${FLASK_BACKEND_URL}?`);
    } finally {
      setIsProcessing(false); // Reset processing flag
      // Always draw wand effects after processing, regardless of hand detection
      drawWandEffects();
      animationFrameId.current = requestAnimationFrame(sendFrameToBackend); // Request next frame
    }
  };

  /**
   * Starts the requestAnimationFrame loop for sending frames to the backend.
   * Clears any previous animation frame requests.
   */
  const startSendingFrames = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(sendFrameToBackend);
  };

  /**
   * Updates the wand tip position, spell trail, and generates sparkles
   * based on the index finger tip landmark.
   * @param {Array<Object>} landmarks - An array of hand landmarks.
   */
  const updateWandPosition = (landmarks) => {
    if (landmarks && landmarks.length > 8) {
      // Index finger tip is landmark 8
      const indexTip = landmarks[8];
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        // Flip x coordinate to match mirrored video
        const newX = (1 - indexTip.x) * canvasElement.width;
        const newY = indexTip.y * canvasElement.height;

        setWandTip({ x: newX, y: newY });

        // Add to spell trail
        setSpellTrail(prevTrail => {
          const newTrail = [...prevTrail, { x: newX, y: newY, timestamp: Date.now() }];
          // Keep only recent points (e.g., last 2 seconds) and limit trail length
          return newTrail.filter(point => Date.now() - point.timestamp < 2000).slice(-40); // Increased trail length for smoother effect
        });

        // Generate sparkles randomly
        if (Math.random() < 0.4) { // Increased sparkle frequency
          const newSparkle = {
            x: newX + (Math.random() - 0.5) * 60, // Wider spread
            y: newY + (Math.random() - 0.5) * 60,
            timestamp: Date.now(),
            size: Math.random() * 10 + 5 // Larger sparkles
          };
          setSparkles(prev => [...prev, newSparkle]);
        }
      }
    }
  };

  /**
   * Clears the spell trail and sparkles from the state and the wand canvas.
   */
  const clearWandEffects = () => {
    setSpellTrail([]);
    setSparkles([]);
    const wandCanvas = wandCanvasRef.current;
    if (wandCanvas) {
      const ctx = wandCanvas.getContext('2d');
      ctx.clearRect(0, 0, wandCanvas.width, wandCanvas.height);
    }
  };

  /**
   * Draws the spell trail, sparkles, and wand tip on the dedicated wand canvas.
   * This function is now called directly within the main animation loop.
   */
  const drawWandEffects = () => {
    const wandCanvas = wandCanvasRef.current;
    if (!wandCanvas || !videoRef.current) return; // Ensure videoRef.current is available for dimensions

    const ctx = wandCanvas.getContext('2d');
    // Set canvas dimensions to match video feed
    wandCanvas.width = videoRef.current.videoWidth;
    wandCanvas.height = videoRef.current.videoHeight;

    ctx.clearRect(0, 0, wandCanvas.width, wandCanvas.height);

    // *** DEBUGGING CHANGE START ***
    const currentSpell = spells[activeSpellRef.current]; // Use the ref for latest active spell
    console.log("drawWandEffects Debug: activeSpellRef.current =", activeSpellRef.current, "Color:", currentSpell.color);
    // *** DEBUGGING CHANGE END ***


    // Draw spell trail
    if (spellTrail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < spellTrail.length; i++) {
        const point1 = spellTrail[i - 1];
        const point2 = spellTrail[i];
        const age = Date.now() - point2.timestamp;
        const alpha = Math.max(0, 1 - age / 2000); // Trail fades over 2 seconds
        const lineWidth = 8 * alpha; // Trail width also fades

        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = currentSpell.color;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
      }
    }

    // Draw sparkles
    ctx.globalAlpha = 1; // Reset global alpha for sparkles
    setSparkles(prevSparkles => { // Filter sparkles here to ensure they fade out
      const livingSparkles = prevSparkles.filter(sparkle => Date.now() - sparkle.timestamp < 1000); // Sparkles live for 1 second

      livingSparkles.forEach(sparkle => {
        const age = Date.now() - sparkle.timestamp;
        const alpha = Math.max(0, 1 - age / 1000); // Sparkle fades over 1 second

        ctx.globalAlpha = alpha;
        ctx.fillStyle = currentSpell.secondary;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        // Add a glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = currentSpell.color;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * alpha * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow blur
      });
      return livingSparkles; // Return filtered list for next render
    });

    // Draw wand tip
    if (wandTip.x && wandTip.y) {
      ctx.globalAlpha = 1; // Ensure full opacity for wand tip
      ctx.fillStyle = currentSpell.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = currentSpell.color;

      ctx.beginPath();
      ctx.arc(wandTip.x, wandTip.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = currentSpell.secondary;
      ctx.beginPath();
      ctx.arc(wandTip.x, wandTip.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0; // Reset shadow blur
    }
    ctx.globalAlpha = 1; // Reset global alpha after drawing
  };

  /**
   * Draws hand landmarks on the main canvas.
   * Note: This implementation manually draws connections and landmarks
   * since MediaPipe's drawing_utils and HAND_CONNECTIONS are not imported.
   * @param {Array<Array<Object>>} multiHandLandmarks - Array of landmark arrays for detected hands.
   */
  const drawHandLandmarks = (multiHandLandmarks) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement || !videoRef.current) return;

    const canvasCtx = canvasElement.getContext('2d');
    canvasElement.width = videoRef.current.videoWidth;
    canvasElement.height = videoRef.current.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0); // Flip horizontally
    canvasCtx.scale(-1, 1);

    if (multiHandLandmarks && multiHandLandmarks.length > 0) {
      // *** DEBUGGING CHANGE START ***
      const currentSpell = spells[activeSpellRef.current]; // Use the ref for latest active spell
      console.log("drawHandLandmarks Debug: activeSpellRef.current =", activeSpellRef.current, "Color:", currentSpell.color);
      // *** DEBUGGING CHANGE END ***

      for (const landmarksArray of multiHandLandmarks) {
        // Define simplified connections for drawing
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17] // Palm connections
        ];

        // Draw hand connections with spell colors
        canvasCtx.strokeStyle = currentSpell.color;
        canvasCtx.lineWidth = 3;
        canvasCtx.shadowBlur = 5;
        canvasCtx.shadowColor = currentSpell.color;

        connections.forEach(([start, end]) => {
          if (landmarksArray[start] && landmarksArray[end]) {
            canvasCtx.beginPath();
            // Scale landmark coordinates to canvas dimensions
            canvasCtx.moveTo(landmarksArray[start].x * canvasElement.width, landmarksArray[start].y * canvasElement.height);
            canvasCtx.lineTo(landmarksArray[end].x * canvasElement.width, landmarksArray[end].y * canvasElement.height);
            canvasCtx.stroke();
          }
        });

        // Draw landmarks as glowing points
        landmarksArray.forEach((landmark, index) => {
          canvasCtx.fillStyle = index === 8 ? currentSpell.secondary : currentSpell.color; // Highlight index finger tip
          canvasCtx.shadowBlur = index === 8 ? 10 : 5;
          canvasCtx.shadowColor = currentSpell.color;

          canvasCtx.beginPath();
          canvasCtx.arc(
            landmark.x * canvasElement.width,
            landmark.y * canvasElement.height,
            index === 8 ? 8 : 4, // Larger radius for index finger tip
            0,
            Math.PI * 2
          );
          canvasCtx.fill();
        });
      }

      canvasCtx.shadowBlur = 0; // Reset shadow blur after drawing hands
    }

    canvasCtx.restore();
  };

  /**
   * Handle spell change with immediate visual feedback
   */
  const handleSpellChange = (spellKey) => {
    setActiveSpell(spellKey);
    // *** DEBUGGING CHANGE START ***
    // Update the ref immediately after state is set
    activeSpellRef.current = spellKey;
    console.log("handleSpellChange: activeSpell set to", spellKey);
    // *** DEBUGGING CHANGE END ***
  };

  /**
   * useEffect hook for initial setup and cleanup.
   * Runs once on component mount.
   */
  useEffect(() => {
    // *** DEBUGGING CHANGE START ***
    // Initialize activeSpellRef with the initial activeSpell state
    activeSpellRef.current = activeSpell;
    // *** DEBUGGING CHANGE END ***

    getWebcamAccess(); // Request webcam access and start frame sending

    // Cleanup function: stops webcam stream and cancels animation frame
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // *** DEBUGGING CHANGE START ***
  // This useEffect ensures activeSpellRef always holds the latest state value.
  // This is crucial for functions defined outside the render cycle (like those
  // called by requestAnimationFrame) to access the correct, up-to-date state.
  useEffect(() => {
    activeSpellRef.current = activeSpell;
    console.log("activeSpell state updated to:", activeSpell);
  }, [activeSpell]); // Dependency array: runs whenever activeSpell state changes
  // *** DEBUGGING CHANGE END ***

  const handleRetry = () => {
    setError(null);
    getWebcamAccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 font-inter text-white">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 max-w-6xl w-full border-4 border-purple-600 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6 text-center text-purple-300">
          <HandHelping className="inline-block mr-3 h-10 w-10" />
          Wizard's Wand Hand Tracking ✨
        </h1>

        {/* Spell Selection */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {Object.entries(spells).map(([key, spell]) => (
            <button
              key={key}
              onClick={() => handleSpellChange(key)}
              // Apply dynamic styling based on activeSpell and the spell's color
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 ${
                activeSpell === key
                  ? `shadow-lg scale-105` // No hardcoded yellow here
                  : 'border-gray-600 bg-gray-700 bg-opacity-50 text-gray-300 hover:border-purple-400'
              }`}
              style={{
                // Dynamically set border, background, text color, and shadow based on the spell's defined colors
                borderColor: activeSpell === key ? spell.color : '',
                backgroundColor: activeSpell === key ? `${spell.color}20` : '', // 20 for 12.5% opacity
                color: activeSpell === key ? spell.color : '', // Text color matches spell
                boxShadow: activeSpell === key ? `0 0 20px ${spell.color}40` : 'none', // 40 for 25% opacity
              }}
            >
              <span className="text-xl">{spell.emoji}</span>
              <span className="font-semibold">{spell.name}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-purple-400 mb-4" />
            <p className="text-lg text-gray-300">Loading webcam and connecting to magic server...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-200 p-4 rounded-xl text-center w-full my-4">
            <p className="font-semibold mb-2">Error:</p>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry Webcam
            </button>
          </div>
        )}

        {!loading && !error && !cameraInitialized && (
          <div className="bg-yellow-700 bg-opacity-30 border border-yellow-500 text-yellow-200 p-4 rounded-xl text-center w-full my-4">
            <p className="font-semibold mb-2">Waiting for Camera Access</p>
            <p>Please allow webcam access in your browser to start casting spells.</p>
            <button
              onClick={handleRetry}
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry Webcam
            </button>
          </div>
        )}

        <div className="relative w-full max-w-full aspect-video rounded-xl overflow-hidden border-4 border-blue-500 shadow-lg bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform scaleX(-1 rounded-xl"
            style={{ display: cameraInitialized ? 'block' : 'none' }}
            autoPlay
            playsInline
          />
          {/* Main canvas for hand landmarks */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            style={{ display: cameraInitialized ? 'block' : 'none' }}
          />
          {/* Separate canvas for wand effects to layer on top */}
          <canvas
            ref={wandCanvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none" // pointer-events-none ensures clicks pass through
            style={{ display: cameraInitialized ? 'block' : 'none' }}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-2">
            Point your wand (index finger) towards the webcam and cast magical spells! ✨
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span>Current Spell: <strong style={{ color: spells[activeSpell].color }}>{spells[activeSpell].name}</strong> {spells[activeSpell].emoji}</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        {/* Spell Instructions */}
        <div className="mt-4 bg-indigo-800 bg-opacity-30 rounded-xl p-4 border border-indigo-600">
          <h3 className="text-lg font-semibold mb-2 text-center text-indigo-300 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Spell Instructions
          </h3>
          <div className="text-sm text-indigo-200 text-center">
            <p>• Select a spell from the buttons above</p>
            <p>• Point your index finger at the camera (this becomes your wand tip)</p>
            <p>• Move your finger to cast magical trails and sparkles</p>
            <p>• Try different spells to see various magical effects!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandTrackingPage;