import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Star, Sparkles, BookOpen, Home, Users, Beaker } from 'lucide-react';
import SketchfabViewer from '../components/common/SketchfabViewer'; // Import the SketchfabViewer component

const HogwartsNavigator = () => {
  const [currentLocation, setCurrentLocation] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSketchfabUid, setCurrentSketchfabUid] = useState(null);
  const [isSketchfabViewerReady, setIsSketchfabViewerReady] = useState(false);
  const sketchfabApiRef = useRef(null); // To store the Sketchfab API object for active model

  const locations = {
    home: {
      title: "Welcome to Hogwarts",
      subtitle: "Choose your destination",
      description: "Explore the magical world of Harry Potter through these immersive 3D environments",
      color: "from-purple-900 to-indigo-900"
    },
    dumbledore: {
      title: "Dumbledore's Office",
      subtitle: "The Headmaster's Sanctuary",
      description: "Step into the circular office filled with magical artifacts, portraits of former headmasters, and Fawkes the phoenix.",
      uid: "c5fdffa78c9442bb93a88c386d4ad53d", // Only store the UID
      color: "from-amber-900 to-orange-900"
    },
    greathall: {
      title: "The Great Hall",
      subtitle: "Where Magic Begins",
      description: "Experience the grandeur of Hogwarts' Great Hall with its floating candles, house tables, and enchanted ceiling.",
      uid: "203784d1e8704cfba3af8a2b224b74ff", // Only store the UID
      color: "from-yellow-900 to-red-900"
    },
    greathall2: {
      title: "Great Hall (Animated)",
      subtitle: "The Heart of Hogwarts",
      description: "An animated version of the Great Hall with magical effects and atmospheric lighting.",
      uid: "bde62298ac8640588d5a2928b8e113dc", // Only store the UID
      color: "from-red-900 to-pink-900"
    },
    gryffindor: {
      title: "Gryffindor Common Room",
      subtitle: "Home of the Brave",
      description: "Relax in the cozy Gryffindor common room with its warm fireplace, comfortable armchairs, and scarlet decorations.",
      uid: "e0098e6fdf81498795590168c97a83d7", // Only store the UID
      color: "from-red-900 to-rose-900"
    },
    potions: {
      title: "Potions Classroom",
      subtitle: "Professor Snape's Domain",
      description: "Enter the dimly lit potions classroom in the dungeons, filled with bubbling cauldrons and mysterious ingredients.",
      uid: "02272f658ddf44c18e4d23a90e4f8d26", // Only store the UID
      color: "from-green-900 to-teal-900"
    }
  };

  const navigationItems = [
    { key: 'dumbledore', label: 'Dumbledore\'s Office', icon: Star },
    { key: 'greathall', label: 'Great Hall', icon: Home },
    { key: 'greathall2', label: 'Great Hall (Animated)', icon: Sparkles },
    { key: 'gryffindor', label: 'Gryffindor Common Room', icon: Users },
    { key: 'potions', label: 'Potions Classroom', icon: Beaker }
  ];

  // Effect to update the Sketchfab UID when location changes
  useEffect(() => {
    if (currentLocation !== 'home' && locations[currentLocation]?.uid) {
      setCurrentSketchfabUid(locations[currentLocation].uid);
      setIsSketchfabViewerReady(false); // Reset ready state for new model
    } else {
      setCurrentSketchfabUid(null); // No model for home page
      setIsSketchfabViewerReady(false);
      sketchfabApiRef.current = null; // Clear API reference
    }
  }, [currentLocation, locations]);

  const handleLocationChange = (location) => {
    setIsLoading(true);
    // Add a slight delay to allow loading spinner to show
    setTimeout(() => {
      setCurrentLocation(location);
      // isLoading will be set to false once the SketchfabViewer's onViewerReady fires
      // if it's a model page, or after the timeout if it's the home page.
      if (location === 'home') {
          setIsLoading(false);
      }
    }, 500); // Small delay for loading animation
  };

  const handleSketchfabViewerReady = (api) => {
    setIsSketchfabViewerReady(true);
    setIsLoading(false); // Model is ready, hide loading spinner
    sketchfabApiRef.current = api; // Store the API object
    console.log(`Sketchfab API for ${currentLocation} is ready!`);

    // Example of using the API:
    // if (currentLocation === 'dumbledore' && api) {
    //   // You can call Sketchfab API functions here
    //   // api.camera.setFov(45);
    // }
  };

  const createStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`
      };
      stars.push(
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
          style={style}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${locations[currentLocation].color} relative overflow-hidden text-white`}>
      {/* Animated Stars Background */}
      <div className="fixed inset-0 pointer-events-none">
        {createStars()}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Casting magic...</p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <header className="text-center py-8 px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 tracking-wide">
            HOGWARTS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 italic">
            School of Witchcraft and Wizardry
          </p>
        </header>

        {/* Navigation */}
        {currentLocation !== 'home' && (
          <div className="px-4 mb-6">
            <button
              onClick={() => handleLocationChange('home')}
              className="flex items-center space-x-2 bg-black bg-opacity-30 hover:bg-opacity-50 px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Map</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 pb-8">
          {currentLocation === 'home' ? (
            // Home Page - Location Selection
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {locations[currentLocation].title}
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {locations[currentLocation].description}
                </p>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleLocationChange(item.key)}
                      className="group relative bg-black bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-yellow-400"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full group-hover:rotate-12 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-gray-400 text-sm text-center">
                          Explore this magical location in 3D
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Location Detail Page
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {locations[currentLocation].title}
                </h2>
                <p className="text-xl text-yellow-400 mb-4 italic">
                  {locations[currentLocation].subtitle}
                </p>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  {locations[currentLocation].description}
                </p>
              </div>

              {/* 3D Model Container (using SketchfabViewer component) */}
              <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <div className="w-full h-96 md:h-[600px] rounded-lg overflow-hidden relative">
                  {currentSketchfabUid && (
                    <SketchfabViewer
                      uid={currentSketchfabUid}
                      onViewerReady={handleSketchfabViewerReady}
                      className="w-full h-full"
                      // Initially hide the viewer until it's ready to prevent flashes
                      // The SketchfabViewer component itself handles the 'hidden' class based on viewerInitialized
                      hidden={!isSketchfabViewerReady || isLoading}
                    />
                  )}
                  {/* Optional: Overlay a loading spinner specifically for the iframe if SketchfabViewer is not ready */}
                  {!isSketchfabViewerReady && currentSketchfabUid && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Use your mouse to navigate around the 3D environment. Click and drag to rotate, scroll to zoom.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Magical Elements */}
      <div className="fixed bottom-10 right-10 pointer-events-none">
        <div className="animate-bounce">
          <Sparkles className="w-8 h-8 text-yellow-400 opacity-70" />
        </div>
      </div>
    </div>
  );
};

export default HogwartsNavigator;