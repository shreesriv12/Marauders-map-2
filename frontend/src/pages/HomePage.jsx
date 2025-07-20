import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Text, Float, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import { HarryPotterModel } from '../components/Hero/Harryavatar';
import { HarryPotterLogoModel } from '../components/Hero/HarryPotterLogoModel';
import { HermioneGrangerModel } from '../components/Hero/Hermoineavatar';
import { RonWeasleyModel } from '../components/Hero/Ronavatar';
import { SnapeModel } from '../components/Hero/Snapeavatar';
import { McGonagallModel } from '../components/Hero/Macgonagalavatar';
import { HagridModel } from '../components/Hero/Hagridavatar';
import { DumbledoreModel } from '../components/Hero/Dumbledoreavatar';
import { DracoMalfoyModel } from '../components/Hero/Dracoavatar';

// Helper for converting degrees to radians
const degToRad = (degrees) => degrees * (Math.PI / 180);

// --- Wrapper components that add animations and effects to your imported models ---
// These components now receive `defaultRotationY` which is the hardcoded base rotation
// and add a subtle animation on top of it.
const AnimatedHarryPotterModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <HarryPotterModel />
            <Sparkles count={20} scale={2} size={2} speed={0.5} color="#FFD700" /> {/* Gold sparks */}
        </group>
    );
};

const AnimatedHermioneGrangerModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.3 + Math.PI) * 0.1;
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <HermioneGrangerModel />
            <Sparkles count={15} scale={1.5} size={1.5} speed={0.3} color="#FF69B4" /> {/* Pink sparks */}
        </group>
    );
};

const AnimatedRonWeasleyModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.4 + Math.PI / 2) * 0.1;
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <RonWeasleyModel />
            <Sparkles count={12} scale={1.3} size={1.2} speed={0.4} color="#FF6347" /> {/* Orange-Red sparks */}
        </group>
    );
};

const AnimatedSnapeModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.35) * 0.07; // Slower, more subtle
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <SnapeModel />
            <Sparkles count={18} scale={1.8} size={1.8} speed={0.4} color="#A9A9A9" /> {/* Silver/grey sparks */}
        </group>
    );
};

const AnimatedMcGonagallModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <McGonagallModel />
            <Sparkles count={15} scale={1.5} size={1.5} speed={0.3} color="#008000" /> {/* Green sparks for McGonagall/Gryffindor */}
        </group>
    );
};

const AnimatedHagridModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.3) * 0.08; // Slower, gentler animation
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <HagridModel />
            <Sparkles count={12} scale={2.0} size={2.0} speed={0.2} color="#8B4513" /> {/* Earthy/brown sparks for Hagrid */}
        </group>
    );
};

const AnimatedDumbledoreModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.25) * 0.05; // Gentle, wise sway
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <DumbledoreModel />
            <Sparkles count={20} scale={1.8} size={1.8} speed={0.5} color="#FFD700" /> {/* Gold/magical sparks */}
        </group>
    );
};

const AnimatedDracoMalfoyModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            groupRef.current.rotation.y = defaultRotationY + Math.sin(state.clock.elapsedTime * 0.5) * 0.08; // Subtle, perhaps slightly haughty, animation
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <DracoMalfoyModel />
            <Sparkles count={15} scale={1.6} size={1.6} speed={0.45} color="#A9A9A9" /> {/* Silver/green sparks for Slytherin */}
        </group>
    );
};

const AnimatedHarryPotterLogoModel = ({ position, rotation, scale }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <HarryPotterLogoModel />
                <Sparkles count={30} scale={3} size={3} speed={0.8} color="#FFD700" />
            </Float>
        </group>
    );
};

// Video Background Component with enhanced twinkling
const VideoBackground = () => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current) {
            console.log("Attempting to play video background..."); // Added console log
            videoRef.current.play().catch(error => {
                console.warn("Autoplay was prevented. User interaction might be required to play video.", error);
                console.error("Video play error:", error); // Log the error more verbosely
            });
        }
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                ref={videoRef}
                className="absolute w-full h-full object-cover"
                src="/video/hogwarts.mp4" // Ensure this path is correct
                autoPlay
                loop
                muted
                playsInline
                style={{ zIndex: 0 }} // Added explicit z-index to ensure it's behind everything
            >
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
            {/* Enhanced Twinkling Stars */}
            {[...Array(150)].map((_, i) => ( // Increased count for more stars
                <motion.div
                    key={`star-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: 0,
                        scale: Math.random() * 0.5 + 0.5 // Vary initial size
                    }}
                    animate={{
                        opacity: [0, 1, 0.3, 1, 0], // More pronounced twinkling
                        scale: [0.5, 1.2, 0.7, 1.2, 0.5], // More dynamic scaling
                        x: `+=${(Math.random() - 0.5) * 50}`, // Subtle horizontal drift
                        y: `+=${(Math.random() - 0.5) * 50}`  // Subtle vertical drift
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 4 // Increased delay range for more staggered effect
                    }}
                    style={{
                        boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)', // Slight glow
                        filter: 'blur(0.2px)'
                    }}
                />
            ))}
            {/* Orbs (kept as is, they add to the magical feel) */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={`orb-${i}`}
                    className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                        x: [null, Math.random() * window.innerWidth],
                        y: [null, Math.random() * window.innerHeight],
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.4, 1]
                    }}
                    transition={{
                        duration: 8 + Math.random() * 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 3
                    }}
                    style={{
                        boxShadow: '0 0 20px rgba(255, 212, 0, 0.8)',
                        filter: 'blur(0.5px)'
                    }}
                />
            ))}
        </div>
    );
};

// Enhanced Magical Loading Component
const MagicalLoading = () => (
    <Html center>
        <div className="text-center">
            <div className="relative">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mb-4"></div>
                <div className="absolute inset-0 animate-pulse">
                    <div className="inline-block rounded-full h-16 w-16 border-2 border-purple-400 border-opacity-50"></div>
                </div>
            </div>
            <p className="text-yellow-300 text-xl font-bold mb-2">Summoning Hogwarts Magic...</p>
            <div className="flex justify-center space-x-1">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-yellow-400 rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>
        </div>
    </Html>
);

// Enhanced Navigation Component
const Navigation = ({ activeSection, setActiveSection }) => {
    const navigate = useNavigate(); // For routing
    const navItems = [
        { id: 'home', label: 'Hogwarts', icon: '🏰' },
        { id: 'characters', label: 'Characters', icon: '⚡' },
        { id: 'spells', label: 'Spells', icon: '🪄' },
        { id: 'houses', label: 'Houses', icon: '🦁' },
        { id: 'tour', label: 'Virtual Tour', icon: '🧳' },
        { id: 'contact', label: 'Contact Us', icon: '✉️' },
        { label: 'Login', icon: '🔑', path: '/login' },
        { label: 'Register', icon: '☺️', path: '/register' }
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    return (
        <motion.nav
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-8 py-4 border border-yellow-400/30 shadow-2xl">
                <div className="flex space-x-6">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.label}
                            onClick={() => {
                                if (item.path) {
                                    navigate(item.path); // route to /login or /register
                                } else {
                                    scrollToSection(item.id);
                                }
                            }}
                            className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                                activeSection === item.id
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                                    : 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-400/20'
                            }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-semibold">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.nav>
    );
};

// Enhanced Character Info Panel
const CharacterPanel = ({ character, isVisible, onClose }) => {
    // --- Updated characters data with 5 new entries ---
    const characters = {
        harry: {
            name: "Harry Potter",
            house: "Gryffindor",
            patronus: "Stag",
            wand: "Holly, Phoenix Feather, 11 inches",
            description: "The Boy Who Lived, known for his lightning bolt scar and exceptional courage.",
            color: "from-red-600 to-yellow-600"
        },
        hermione: {
            name: "Hermione Granger",
            house: "Gryffindor",
            patronus: "Otter",
            wand: "Vine, Dragon Heartstring, 10¾ inches",
            description: "The brightest witch of her age, known for her intelligence and loyalty.",
            color: "from-pink-600 to-purple-600"
        },
        ron: {
            name: "Ron Weasley",
            house: "Gryffindor",
            patronus: "Terrier",
            wand: "Willow, Unicorn Hair, 14 inches",
            description: "Harry's best friend, known for his bravery and strategic thinking.",
            color: "from-orange-600 to-red-600"
        },
        snape: { // New character data
            name: "Severus Snape",
            house: "Slytherin",
            patronus: "Doe",
            wand: "Blackthorn, 12¾ inches, stiff", // Common interpretation for Snape's wand
            description: "The enigmatic Potions Master and Head of Slytherin, whose true loyalties are a mystery.",
            color: "from-gray-700 to-green-900" // Slytherin colors
        },
        mcgonagall: { // New character data
            name: "Professor McGonagall",
            house: "Gryffindor",
            patronus: "Cat",
            wand: "Fir, Dragon Heartstring, 9½ inches",
            description: "The strict but fair Head of Gryffindor and Transfiguration professor, fiercely loyal to Hogwarts.",
            color: "from-emerald-700 to-green-900" // Gryffindor/McGonagall-like colors
        },
        hagrid: { // New character data
            name: "Rubeus Hagrid",
            house: "Gryffindor (unofficial)",
            patronus: "None (too big)", // He can't produce one in the books/films
            wand: "Oak, 16 inches, roughly made (part of his umbrella)",
            description: "The Keeper of Keys and Grounds at Hogwarts, a half-giant with a gentle heart and a love for magical creatures.",
            color: "from-amber-700 to-yellow-800" // Earthy, warm colors for Hagrid
        },
        dumbledore: { // New character data
            name: "Albus Dumbledore",
            house: "Gryffindor",
            patronus: "Phoenix",
            wand: "Elder Wand (formerly)",
            description: "The wise and powerful Headmaster of Hogwarts, a legend in the wizarding world.",
            color: "from-purple-700 to-indigo-900" // Magical, wise colors for Dumbledore
        },
        draco: { // New character data
            name: "Draco Malfoy",
            house: "Slytherin",
            patronus: "None (though a weasel would be fitting for his early years)",
            wand: "Hawthorn, Unicorn Hair, 10 inches, reasonably springy",
            description: "Harry Potter's archenemy, a pure-blood wizard and member of Slytherin House, whose life takes a complex turn.",
            color: "from-gray-700 to-green-900" // Slytherin colors
        }
    };

    if (!isVisible || !character) return null;

    const char = characters[character];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={`bg-gradient-to-br ${char.color} p-1 rounded-2xl max-w-lg mx-4 relative`}
                    initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-8 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300 text-3xl font-bold transition-colors"
                        >
                            ×
                        </button>

                        <motion.h2
                            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {char.name}
                        </motion.h2>

                        <div className="space-y-4">
                            {Object.entries(char).filter(([key]) => !['name', 'color'].includes(key)).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    className="flex items-start space-x-3"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <span className="text-yellow-300 font-bold text-lg capitalize min-w-[100px]">
                                        {key}:
                                    </span>
                                    <span className="text-gray-300 text-lg">{value}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            className="mt-8 flex justify-center"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg transition-all duration-300"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Enhanced Floating Elements
const FloatingElements = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            {/* Magical Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: 0
                    }}
                    animate={{
                        y: [null, -30, 30, -30],
                        opacity: [0, 1, 0.5, 1, 0],
                        scale: [1, 2, 1, 2, 1]
                    }}
                    transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 3
                    }}
                    style={{
                        boxShadow: '0 0 10px rgba(255, 212, 0, 0.8)',
                        filter: 'blur(0.5px)'
                    }}
                />
            ))}

            {/* Floating Letters */}
            {['H', 'O', 'G', 'W', 'A', 'R', 'T', 'S'].map((letter, i) => (
                <motion.div
                    key={`letter-${i}`}
                    className="absolute text-6xl font-bold text-yellow-400/20 pointer-events-none"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        rotate: Math.random() * 360
                    }}
                    animate={{
                        y: [null, -100, 100, -100],
                        rotate: [null, 360, -360, 360],
                        opacity: [0.1, 0.3, 0.1, 0.3]
                    }}
                    transition={{
                        duration: 20 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                >
                    {letter}
                </motion.div>
            ))}
        </div>
    );
};

const CharacterCarousel = ({ onCharacterSelect }) => { // Removed characterScales, characterPositions, characterRotations from props
    const [characterScales, setCharacterScales] = useState({
        harry: [0.030, 0.030, 0.030],
        hermione: [0.030, 0.030, 0.030],
        ron: [0.030, 0.030, 0.030],
        snape: [0.041, 0.041, 0.041],
        mcgonagall: [0.026, 0.026, 0.026],
        hagrid: [0.015, 0.015, 0.015],
        dumbledore: [0.022, 0.022, 0.022],
        draco: [0.030, 0.030, 0.030],
    });

    // You can define default positions and rotations here or pass them as props if they are dynamic
    const characterPositions = {
        harry: 0,
        hermione: 0,
        ron: 0,
        snape: 0,
        mcgonagall: 0,
        hagrid: 0,
        dumbledore: 0,
        draco: 0,
    };

    const characterRotations = {
        harry: Math.PI,
        hermione: Math.PI,
        ron: Math.PI,
        snape: Math.PI,
        mcgonagall: Math.PI,
        hagrid: Math.PI,
        dumbledore: Math.PI,
        draco: Math.PI,
    };

    const characters = [
        { id: 'harry', name: 'Harry Potter', model: AnimatedHarryPotterModel },
        { id: 'hermione', name: 'Hermione Granger', model: AnimatedHermioneGrangerModel },
        { id: 'ron', name: 'Ron Weasley', model: AnimatedRonWeasleyModel },
        { id: 'snape', name: 'Severus Snape', model: AnimatedSnapeModel },
        { id: 'mcgonagall', name: 'Professor McGonagall', model: AnimatedMcGonagallModel },
        { id: 'hagrid', name: 'Rubeus Hagrid', model: AnimatedHagridModel },
        { id: 'dumbledore', name: 'Albus Dumbledore', model: AnimatedDumbledoreModel },
        { id: 'draco', name: 'Draco Malfoy', model: AnimatedDracoMalfoyModel },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const showNextCharacter = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
    };

    const showPrevCharacter = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + characters.length) % characters.length);
    };

    const currentCharacter = characters[currentIndex];

    return (
        <div className="relative w-full h-[90vh] min-h-[700px] max-h-[1000px] mx-auto mb-8">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 60 }}
                style={{ background: 'transparent' }}
                shadows
            >
                <Suspense fallback={<MagicalLoading />}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                    <pointLight position={[-5, -5, 5]} intensity={0.8} />

                    {characters.map((char, index) => {
                        const CharacterModel = char.model;
                        const currentScale = characterScales[char.id] || [0.03, 0.03, 0.03];
                        const currentZPosition = characterPositions[char.id] !== undefined ? characterPositions[char.id] : 0;
                        const currentYRotation = characterRotations[char.id] !== undefined ? characterRotations[char.id] : Math.PI;

                        const characterWorldPosition = [0, -2.8, currentZPosition];
                        const characterWorldRotation = [0, currentYRotation, 0];

                        return (
                            <CharacterModel
                                key={char.id}
                                position={characterWorldPosition}
                                rotation={characterWorldRotation}
                                scale={currentScale}
                                isVisible={index === currentIndex}
                                defaultRotationY={currentYRotation}
                            />
                        );
                    })}

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={true}
                        target={[0, -0.5, 0]}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                    />
                </Suspense>
            </Canvas>

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-8">
                <motion.h3
                    key={currentCharacter.name}
                    className="text-4xl font-bold text-yellow-300 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {currentCharacter.name}
                </motion.h3>

                <div className="flex justify-between w-full max-w-sm">
                    <motion.button
                        onClick={showPrevCharacter}
                        className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full shadow-lg hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <span className="text-3xl">◀</span>
                    </motion.button>
                    <motion.button
                        onClick={() => onCharacterSelect(currentCharacter.id)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        View Details
                    </motion.button>
                    <motion.button
                        onClick={showNextCharacter}
                        className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full shadow-lg hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <span className="text-3xl">▶</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

// NEW: Spells Section Component
const SpellsSection = () => (
    <section id="spells" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
        <h2 className="text-5xl font-bold text-yellow-400 mb-8">Master the Spells</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
            From "Wingardium Leviosa" to "Expelliarmus," delve into the magical incantations that shape the wizarding world.
            Learn about their origins, effects, and how to master them!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700 shadow-lg">
                <h3 className="text-3xl font-semibold text-yellow-300 mb-4">Charms</h3>
                <p className="text-gray-300">Spells that add properties to an object or person.</p>
            </div>
            <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-700 shadow-lg">
                <h3 className="text-3xl font-semibold text-yellow-300 mb-4">Transfiguration</h3>
                <p className="text-gray-300">Spells that change the form or appearance of an object.</p>
            </div>
            <div className="bg-red-900/50 p-6 rounded-xl border border-red-700 shadow-lg">
                <h3 className="text-3xl font-semibold text-yellow-300 mb-4">Hexes & Curses</h3>
                <p className="text-gray-300">Darker spells intended to cause harm or misfortune.</p>
            </div>
        </div>
        <motion.button
            className="mt-12 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            Explore All Spells
        </motion.button>
    </section>
);

// Main App Component
const HogwartsExperience = () => {
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [activeSection, setActiveSection] = useState('home');

    // Callback to set the active section based on scroll
    const handleScroll = useCallback(() => {
        const sections = ['home', 'characters', 'spells', 'houses', 'tour', 'contact'];
        const scrollPosition = window.scrollY + window.innerHeight / 2; // Check midpoint of the viewport

        for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
                if (scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
                    setActiveSection(sectionId);
                    break;
                }
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className="relative min-h-screen bg-black text-white font-harry-potter overflow-hidden">
            <VideoBackground />
            <FloatingElements />
            <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="relative z-10">
                {/* Home Section */}
                <section
                    id="home"
                    className="relative h-screen flex flex-col items-center justify-center text-center px-4"
                >
                    <motion.h1
                        className="text-7xl md:text-8xl font-bold text-yellow-400 mt-8 mb-6 drop-shadow-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        Welcome to Hogwarts
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                    >
                        Embark on a magical journey through the wizarding world. Discover characters, spells, and the secrets of Hogwarts.
                    </motion.p>
                    <motion.button
                        className="mt-10 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        onClick={() => {
                            const charactersSection = document.getElementById('characters');
                            if (charactersSection) {
                                charactersSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Begin Your Adventure
                    </motion.button>
                </section>

                {/* Characters Section */}
                <section
                    id="characters"
                    className="py-20 px-4 text-center bg-black/80 backdrop-blur-md z-40 relative"
                >
                    <h2 className="text-5xl font-bold text-yellow-400 mb-12">Meet the Characters</h2>
                    <CharacterCarousel onCharacterSelect={setSelectedCharacter} /> {/* Pass characterScales here */}
                </section>

                {/* Spells Section */}
                <SpellsSection />

                {/* Houses Section */}
                <section id="houses" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
                    <h2 className="text-5xl font-bold text-yellow-400 mb-8">Hogwarts Houses</h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto">
                        Discover the noble houses of Hogwarts: Gryffindor, Hufflepuff, Ravenclaw, and Slytherin.
                        Which house will you belong to?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {/* Gryffindor */}
                        <motion.div
                            className="bg-red-900/50 p-6 rounded-xl border-2 border-red-700 shadow-xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <img src="/images/gryffindor.png" alt="Gryffindor" className="h-24 w-24 mb-4" />
                            <h3 className="text-3xl font-semibold text-yellow-300 mb-2">Gryffindor</h3>
                            <p className="text-gray-300">Courage, Bravery, Determination, Chivalry.</p>
                        </motion.div>
                        {/* Hufflepuff */}
                        <motion.div
                            className="bg-yellow-900/50 p-6 rounded-xl border-2 border-yellow-700 shadow-xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <img src="/images/hufflepuff.png" alt="Hufflepuff" className="h-24 w-24 mb-4" />
                            <h3 className="text-3xl font-semibold text-yellow-300 mb-2">Hufflepuff</h3>
                            <p className="text-gray-300">Dedication, Hard Work, Fair Play, Patience, Loyalty.</p>
                        </motion.div>
                        {/* Ravenclaw */}
                        <motion.div
                            className="bg-blue-900/50 p-6 rounded-xl border-2 border-blue-700 shadow-xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <img src="/images/ravenclaw.png" alt="Ravenclaw" className="h-24 w-24 mb-4" />
                            <h3 className="text-3xl font-semibold text-yellow-300 mb-2">Ravenclaw</h3>
                            <p className="text-gray-300">Intelligence, Creativity, Learning, Wit, Wisdom.</p>
                        </motion.div>
                        {/* Slytherin */}
                        <motion.div
                            className="bg-green-900/50 p-6 rounded-xl border-2 border-green-700 shadow-xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <img src="/images/slytherin.png" alt="Slytherin" className="h-24 w-24 mb-4" />
                            <h3 className="text-3xl font-semibold text-yellow-300 mb-2">Slytherin</h3>
                            <p className="text-gray-300">Ambition, Cunning, Leadership, Resourcefulness.</p>
                        </motion.div>
                    </div>
                </section>

                {/* Virtual Tour Section */}
                <section id="tour" className="py-20 px-4 text-center bg-black/80 backdrop-blur-md text-white z-40 relative">
                    <h2 className="text-5xl font-bold text-yellow-400 mb-8">Virtual Tour of Hogwarts</h2>
                    <p className="text-xl mb-6 max-w-2xl mx-auto">
                        Explore the hallowed halls, secret passages, and iconic locations of Hogwarts Castle in a breathtaking virtual tour.
                    </p>
                    <Link to="/virtual-tour"> {/* Replace "/virtual-tour" with your actual route */}
        <motion.button
            className="mt-8 px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-black font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            Start Tour
        </motion.button>
    </Link>
                </section>

                {/* Contact Us Section */}
                <section id="contact" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
                    <h2 className="text-5xl font-bold text-yellow-400 mb-8">Contact Us</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Have questions about the wizarding world or Hogwarts? Send us an owl!
                    </p>
                    <form className="max-w-md mx-auto space-y-6">
                        <motion.input
                            type="text"
                            placeholder="Your Name"
                            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50 transition-all"
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.input
                            type="email"
                            placeholder="Your Email"
                            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50 transition-all"
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.textarea
                            placeholder="Your Message"
                            rows="6"
                            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-yellow-400 focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50 transition-all"
                            whileFocus={{ scale: 1.02 }}
                        ></motion.textarea>
                        <motion.button
                            type="submit"
                            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Send Message
                        </motion.button>
                    </form>
                </section>
            </main>

            <CharacterPanel character={selectedCharacter} isVisible={!!selectedCharacter} onClose={() => setSelectedCharacter(null)} />

            <footer className="py-8 text-center text-gray-400 text-sm bg-black/90 z-40 relative">
                <p>&copy; {new Date().getFullYear()} Hogwarts Experience. All rights reserved. Not affiliated with Warner Bros. Entertainment.</p>
            </footer>
        </div>
    );
};

export default HogwartsExperience;