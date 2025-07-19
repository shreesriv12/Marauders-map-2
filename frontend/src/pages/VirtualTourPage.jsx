import React, { useState, useEffect } from 'react'; // Added useEffect import
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

const HogwartsVirtualTour = () => {
  const locations = [
    {
      id: 1,
      name: "Great Hall (Animated)",
      description: "The heart of Hogwarts where students gather for meals and ceremonies. Watch the magical atmosphere come alive with floating candles and enchanted ceiling.",
      category: "Main Halls",
      embedUrl: "https://sketchfab.com/models/bde62298ac8640588d5a2928b8e113dc/embed",
      creator: "JER3D",
      featured: true
    },
    {
      id: 2,
      name: "Hogwarts Corridor",
      description: "Walk through the iconic stone corridors where students hurry between classes, portraits watch from the walls, and magic fills every corner.",
      category: "Corridors",
      embedUrl: "https://sketchfab.com/models/664f50be5f674a42a0a4571ba88c5743/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 3,
      name: "Moving Stairs (Animated)",
      description: "Experience the famous moving staircases that shift and change, leading students to different floors and sometimes to unexpected destinations.",
      category: "Architecture",
      embedUrl: "https://sketchfab.com/models/2c5d2b065bb24da6bea628cb6a528547/embed",
      creator: "luismi93",
      featured: true
    },
    {
      id: 4,
      name: "Hogwarts Castle Overview",
      description: "Marvel at the complete Hogwarts castle in all its majestic glory, from the towering spires to the sprawling grounds.",
      category: "Castle Views",
      embedUrl: "https://sketchfab.com/models/70dcec840f8444dda2974aa6a9b049e2/embed",
      creator: "Ju Designer",
      featured: false
    },
    {
      id: 5,
      name: "Grand Hall",
      description: "Another stunning view of the Great Hall, showcasing the architectural grandeur and magical ambiance of this central gathering place.",
      category: "Main Halls",
      embedUrl: "https://sketchfab.com/models/203784d1e8704cfba3af8a2b224b74ff/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 6,
      name: "Gryffindor Common Room (Legacy)",
      description: "Step into the cozy Gryffindor common room with its warm fireplace, comfortable armchairs, and the courage-inspiring atmosphere of the brave house.",
      category: "Common Rooms",
      embedUrl: "https://sketchfab.com/models/370608fe71df40228e710794b817487d/embed",
      creator: "Piotr Związek",
      featured: true
    },
    {
      id: 7,
      name: "Gryffindor Common Room",
      description: "Another beautiful rendition of the Gryffindor common room, where Harry, Ron, and Hermione spent countless hours by the fire.",
      category: "Common Rooms",
      embedUrl: "https://sketchfab.com/models/e0098e6fdf81498795590168c97a83d7/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 8,
      name: "Potions Classroom",
      description: "Enter Professor Snape's domain in the dungeons, where cauldrons bubble and mysterious ingredients line the shelves.",
      category: "Classrooms",
      embedUrl: "https://sketchfab.com/models/02272f658ddf44c18e4d23a90e4f8d26/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 9,
      name: "Dumbledore's Office",
      description: "Visit the headmaster's circular office filled with magical artifacts, sleeping portraits of former headmasters, and Fawkes the phoenix.",
      category: "Offices",
      embedUrl: "https://sketchfab.com/models/c5fdffa78c9442bb93a88c386d4ad53d/embed",
      creator: "zack_graham",
      featured: true
    },
    {
      id: 10,
      name: "Ollivander's Wand Shop",
      description: "Step into the famous wand shop in Diagon Alley where 'the wand chooses the wizard' and thousands of wand boxes reach to the ceiling.",
      category: "Shops",
      embedUrl: "https://sketchfab.com/models/9546dd2854b943719f0a17fa93f53834/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 11,
      name: "Umbridge's Office",
      description: "Experience the sickeningly pink office of Professor Umbridge, complete with kitten plates and an oppressive atmosphere.",
      category: "Offices",
      embedUrl: "https://sketchfab.com/models/dd9bce4ce3614154b535a8a85db32984/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 12,
      name: "Chamber of Secrets (Voxel)",
      description: "Explore the legendary Chamber of Secrets in this unique Minecraft-style interpretation of Salazar Slytherin's hidden chamber.",
      category: "Secret Chambers",
      embedUrl: "https://sketchfab.com/models/da95ebb9bfe9478b8a3aec712aaa947f/embed",
      creator: "binglebeb",
      featured: false
    },
    {
      id: 13,
      name: "Transfiguration Classroom",
      description: "Enter Professor McGonagall's classroom where students learn to transform objects and master the complex art of transfiguration.",
      category: "Classrooms",
      embedUrl: "https://sketchfab.com/models/cde7c77e75b34892ba7c7b60d89138b5/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 14,
      name: "Honeydukes Sweet Shop",
      description: "Visit the magical candy shop in Hogsmeade village, filled with Chocolate Frogs, Bertie Bott's Every Flavour Beans, and other wizarding sweets.",
      category: "Shops",
      embedUrl: "https://sketchfab.com/models/07656ae0593242ec9d6df57d95419384/embed",
      creator: "zack_graham",
      featured: false
    },
    {
      id: 15,
      name: "Chamber of Secrets",
      description: "Descend into the ancient Chamber of Secrets, the legendary hidden chamber within Hogwarts where the monster of Slytherin once dwelled.",
      category: "Secret Chambers",
      embedUrl: "https://sketchfab.com/models/3b462862683e49869ccebe8d1ce85028/embed",
      creator: "zack_graham",
      featured: true
    }
  ];

  const [currentLocation, setCurrentLocation] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(locations.map(loc => loc.category))];
  
  const filteredLocations = selectedCategory === "All" 
    ? locations 
    : locations.filter(loc => loc.category === selectedCategory);

  const nextLocation = () => {
    setCurrentLocation((prev) => (prev + 1) % filteredLocations.length);
  };

  const prevLocation = () => {
    setCurrentLocation((prev) => (prev - 1 + filteredLocations.length) % filteredLocations.length);
  };

  const goToLocation = (index) => {
    setCurrentLocation(index);
  };

  // Ensure current location is valid after filtering
  useEffect(() => {
    if (currentLocation >= filteredLocations.length) {
      setCurrentLocation(0);
    }
  }, [filteredLocations, currentLocation]);

  const current = filteredLocations[currentLocation];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-900/80 via-yellow-800/80 to-amber-900/80 backdrop-blur-sm border-b border-amber-500/30">
        {/* Removed the problematic SVG background div */}
        <div className="relative px-6 py-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-amber-100 mb-4 tracking-wide">
            🏰 Hogwarts Virtual Tour
          </h1>
          <p className="text-center text-amber-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Step into the magical world of Harry Potter and explore the iconic locations of Hogwarts School of Witchcraft and Wizardry
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-6 py-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentLocation(0);
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Location Info */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="text-amber-400 w-6 h-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {current.name}
              </h2>
              {current.featured && <Star className="text-yellow-400 w-6 h-6 fill-current" />}
            </div>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed mb-4">
              {current.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              <span className="bg-slate-700/50 px-3 py-1 rounded-full">
                {current.category}
              </span>
              <span>Created by {current.creator}</span>
              <span>{currentLocation + 1} of {filteredLocations.length}</span>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="relative bg-slate-800/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm border border-slate-700/50">
            <div className="aspect-video w-full relative">
              <iframe
                title={current.name}
                className="w-full h-full border-0"
                allowFullScreen
                mozAllowFullScreen="true"
                webkitAllowFullScreen="true"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                xr-spatial-tracking="true"
                execution-while-out-of-viewport="true"
                execution-while-not-rendered="true"
                web-share="true"
                src={current.embedUrl}
              />
            </div>
            
            {/* Navigation Controls */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <button
                onClick={prevLocation}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20"
                disabled={filteredLocations.length <= 1}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <button
                onClick={nextLocation}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20"
                disabled={filteredLocations.length <= 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Location Thumbnails */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Explore Other Locations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredLocations.map((location, index) => (
                <button
                  key={location.id}
                  onClick={() => goToLocation(index)}
                  className={`relative group bg-slate-800/70 rounded-lg overflow-hidden border transition-all duration-300 hover:scale-105 ${
                    index === currentLocation
                      ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <div className="text-2xl">
                      {location.category === "Main Halls" && "🏛️"}
                      {location.category === "Corridors" && "🚪"}
                      {location.category === "Architecture" && "🏗️"}
                      {location.category === "Castle Views" && "🏰"}
                      {location.category === "Common Rooms" && "🛋️"}
                      {location.category === "Classrooms" && "📚"}
                      {location.category === "Offices" && "🗃️"}
                      {location.category === "Shops" && "🛍️"}
                      {location.category === "Secret Chambers" && "🗝️"}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-white text-xs font-medium leading-tight group-hover:text-amber-300 transition-colors">
                      {location.name}
                    </h4>
                    {location.featured && (
                      <Star className="text-yellow-400 w-3 h-3 mt-1 fill-current" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-slate-800/30 rounded-xl p-6 backdrop-blur-sm border border-slate-700/30">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              ✨ How to Explore
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-slate-300">
              <div className="text-center">
                <div className="text-3xl mb-3">🖱️</div>
                <h4 className="font-medium text-white mb-2">Navigate</h4>
                <p className="text-sm">Click and drag to rotate the view, scroll to zoom in and out</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">⬅️➡️</div>
                <h4 className="font-medium text-white mb-2">Switch Locations</h4>
                <p className="text-sm">Use arrow buttons or click thumbnails to explore different areas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🏷️</div>
                <h4 className="font-medium text-white mb-2">Filter by Category</h4>
                <p className="text-sm">Use category buttons to find specific types of locations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/80 border-t border-slate-700/50 px-6 py-8 text-center">
        <p className="text-slate-400 text-sm">
          All 3D models are embedded from Sketchfab. Credits to the talented creators who brought these magical locations to life.
        </p>
        <p className="text-slate-500 text-xs mt-2">
          🪄 Experience the magic of Hogwarts like never before
        </p>
      </div>
    </div>
  );
};

export default HogwartsVirtualTour;