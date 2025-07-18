import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Text, Float, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import * as THREE from 'three';

// --- Import your GLTF model components ---
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

const AnimatedHarryPotterModel = ({ position, rotation, scale, isVisible, defaultRotationY }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current && isVisible) {
            // Blend the default rotation (from hardcoded value) with a subtle animation
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

// Video Background Component
const VideoBackground = () => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.warn("Autoplay was prevented. User interaction might be required to play video.", error);
            });
        }
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                ref={videoRef}
                className="absolute w-full h-full object-cover"
                src="/videos/harry_potter_background.mp4"
                autoPlay
                loop
                muted
                playsInline
            >
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
            {[...Array(100)].map((_, i) => (
                <motion.div
                    key={`star-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: 0
                    }}
                    animate={{
                        opacity: [0, 1, 0.3, 1, 0],
                        scale: [0.5, 1, 0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                    }}
                />
            ))}
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
    const navItems = [
        { id: 'home', label: 'Hogwarts', icon: '🏰' },
        { id: 'characters', label: 'Characters', icon: '⚡' },
        { id: 'spells', label: 'Spells', icon: '🪄' },
        { id: 'houses', label: 'Houses', icon: '🦁' },
        { id: 'tour', label: 'Virtual Tour', icon: '🧳' },
        { id: 'contact', label: 'Contact Us', icon: '✉️' }
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
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
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


// REMOVED ScaleControls component


// REMOVED PositionControls component


// REMOVED RotationControls component


const CharacterCarousel = ({ onCharacterSelect, characterScales, characterPositions, characterRotations }) => {
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

// NEW: Contact Us Section Component
const ContactUsSection = () => (
    <section id="contact" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
        <h2 className="text-5xl font-bold text-yellow-400 mb-8">Contact Us</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
            Have questions about the Wizarding World, or want to report a magical anomaly?
            Reach out to us!
        </p>
        <div className="flex flex-col items-center space-y-4">
            <a href="mailto:info@hogwartsodyssey.com" className="text-yellow-300 hover:text-yellow-100 text-lg flex items-center space-x-2">
                <span className="text-2xl">📧</span> <span>info@hogwartsodyssey.com</span>
            </a>
            <p className="text-lg flex items-center space-x-2">
                <span className="text-2xl">📞</span> <span>+1 (123) 456-7890</span>
            </p>
            <p className="text-lg">
                Ministry of Magic, Whitehall, London SW1A 0AA
            </p>
        </div>
    </section>
);

// NEW: Virtual Tour Section Component
const VirtualTourSection = () => (
    <section id="tour" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
        <h2 className="text-5xl font-bold text-yellow-400 mb-8">Take a Virtual Tour of Hogwarts</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
            Step into the hallowed halls of Hogwarts School of Witchcraft and Wizardry from anywhere in the world!
            Explore iconic locations like the Great Hall, the Forbidden Forest, and the Room of Requirement.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
            Start Your Tour Now!
        </button>
    </section>
);

// NEW: Footer Component
const Footer = () => (
    <footer className="py-8 px-4 text-center bg-black/80 backdrop-blur-md text-gray-400 z-40 relative">
        <p className="mb-4">© {new Date().getFullYear()} Hogwarts Odyssey. All rights reserved. | Disclaimer: This is a fan-made project.</p>
        <div className="flex justify-center space-x-6 text-2xl">
            <a href="#" className="hover:text-yellow-400 transition-colors">🧙‍♂️</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">🦉</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">✨</a>
        </div>
    </footer>
);


// Main HomePage Component
export default function HomePage() {
    const [activeSection, setActiveSection] = useState('home');
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [showCharacterPanel, setShowCharacterPanel] = useState(false);
    const titleRef = useRef();
    const subtitleRef = useRef();

    // --- State to manage individual character scales ---
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

    // --- NEW STATE: to manage individual character Z-positions ---
    const [characterPositions, setCharacterPositions] = useState({
        harry: 0, // N/A given, defaulting to 0
        hermione: 0.9,
        ron: 0.3,
        snape: -1.0,
        mcgonagall: -0.6,
        hagrid: -1.2,
        dumbledore: -0.2,
        draco: 0, // N/A given, defaulting to 0
    });

    // --- NEW STATE: to manage individual character Y-rotations (converted to radians) ---
    const [characterRotations, setCharacterRotations] = useState({
        harry: degToRad(-180),
        hermione: degToRad(-166),
        ron: degToRad(-180),
        snape: degToRad(2),
        mcgonagall: degToRad(180),
        hagrid: degToRad(180),
        dumbledore: degToRad(180),
        draco: degToRad(180),
    });


    useEffect(() => {
        if (titleRef.current) {
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 100, scale: 0.5, rotationX: -90 },
                { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 2, ease: "power3.out", delay: 0.5 }
            );
        }

        if (subtitleRef.current) {
            gsap.fromTo(subtitleRef.current,
                { opacity: 0, y: 50, letterSpacing: '10px' },
                { opacity: 1, y: 0, letterSpacing: '2px', duration: 1.5, ease: "power2.out", delay: 1.5 }
            );
        }
    }, []);

    const handleCharacterClick = (character) => {
        setSelectedCharacter(character);
        setShowCharacterPanel(true);
    };

    // This list is only used by the REMOVED control components, so it's not strictly needed anymore
    // but I'll keep it as a comment for reference.
    /*
    const charactersListForControls = [
        { id: 'harry', name: 'Harry Potter' },
        { id: 'hermione', name: 'Hermione Granger' },
        { id: 'ron', name: 'Ron Weasley' },
        { id: 'snape', name: 'Severus Snape' },
        { id: 'mcgonagall', name: 'Professor McGonagall' },
        { id: 'hagrid', name: 'Rubeus Hagrid' },
        { id: 'dumbledore', name: 'Albus Dumbledore' },
        { id: 'draco', name: 'Draco Malfoy' },
    ];
    */


    return (
        <div className="relative min-h-screen overflow-auto scroll-smooth">
            {/* Video Background */}
            <VideoBackground />

            {/* Navigation */}
            <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

            {/* REMOVED: Scale Controls */}
            {/* REMOVED: Position Controls */}
            {/* REMOVED: Rotation Controls */}

            {/* Main Hero Section with ONLY Title */}
            <div id="home" className="relative h-screen flex flex-col items-center justify-center">
                <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="relative">
                        <h1
                            ref={titleRef}
                            className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mb-6 drop-shadow-2xl"
                            style={{
                                fontFamily: 'serif',
                                textShadow: '0 0 30px rgba(255, 212, 0, 0.5)'
                            }}
                        >
                            HARRY POTTER
                        </h1>
                        <motion.div
                            className="absolute inset-0 text-7xl md:text-9xl font-bold text-yellow-400/20"
                            animate={{
                                scale: [1, 1.02, 1],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{ fontFamily: 'serif' }}
                        >
                            HARRY POTTER
                        </motion.div>
                    </div>

                    <motion.p
                        ref={subtitleRef}
                        className="text-2xl md:text-3xl text-yellow-300 font-light tracking-wider mb-8"
                        animate={{
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        ✨ Enter the Wizarding World ✨
                    </motion.p>
                </motion.div>

                {/* 3D Scene with ONLY the Logo */}
                <div className="absolute inset-0 z-30">
                    <Canvas
                        camera={{ position: [0, 0.5, 10], fov: 60 }}
                        style={{ background: 'transparent' }}
                        shadows
                    >
                        <Suspense fallback={<MagicalLoading />}>
                            {/* Lighting */}
                            <ambientLight intensity={0.6} />
                            <directionalLight
                                position={[10, 10, 5]}
                                intensity={2}
                                color="#FFD700"
                                castShadow
                                shadow-mapSize-width={1024}
                                shadow-mapSize-height={1024}
                                shadow-camera-far={100}
                                shadow-camera-left={-20}
                                shadow-camera-right={20}
                                shadow-camera-top={20}
                                shadow-camera-bottom={-20}
                            />
                            <pointLight position={[-10, -10, -10]} intensity={1} color="#FF4500" />
                            <pointLight position={[10, 5, 5]} intensity={0.8} color="#9400D3" />

                            {/* Logo - Using your imported model */}
                            <AnimatedHarryPotterLogoModel position={[0, 1.5, -3]} rotation={[0, 0, 0]} scale={[0.0001, 0.0001, 0.0001]} />

                            {/* Environment */}
                            <Environment preset="night" />

                            {/* Controls - Adjusted for logo only */}
                            <OrbitControls
                                enablePan={false}
                                enableZoom={false} // Disable zoom to keep logo fixed
                                enableRotate={true}
                                maxPolarAngle={Math.PI / 2}
                                minDistance={2}
                                maxDistance={15}
                                target={[0, 0, 0]}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            {/* Character Showcase Section */}
            <section id="characters" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 overflow-hidden min-h-[100vh] flex flex-col justify-center items-center">
                <h2 className="text-5xl font-bold text-yellow-400 mb-8">Meet the Iconic Characters</h2>
                <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                    Journey through the Wizarding World and discover the heroes, friends, and formidable adversaries
                    who shape the magical saga. Click "View Details" to learn more about each character!
                </p>

                {/* Character Carousel - now a direct child of the section */}
                <CharacterCarousel
                    onCharacterSelect={handleCharacterClick}
                    characterScales={characterScales}
                    characterPositions={characterPositions}
                    characterRotations={characterRotations}
                />
            </section>

            {/* Character Info Panel */}
            <CharacterPanel character={selectedCharacter} isVisible={showCharacterPanel} onClose={() => setShowCharacterPanel(false)} />

            {/* Other Sections */}
            <section id="spells" className="py-20 px-4 text-center bg-black/80 backdrop-blur-md text-white z-40 relative">
                <h2 className="text-5xl font-bold text-yellow-400 mb-8">Master the Spells</h2>
                <p className="text-xl mb-6 max-w-2xl mx-auto">
                    Learn about the various spells used throughout the series, from simple charms to powerful curses.
                </p>
                {/* Add spell content here */}
            </section>

            <section id="houses" className="py-20 px-4 text-center bg-black/70 backdrop-blur-md text-white z-40 relative">
                <h2 className="text-5xl font-bold text-yellow-400 mb-8">Discover Your House</h2>
                <p className="text-xl mb-6 max-w-2xl mx-auto">
                    Are you a brave Gryffindor, a loyal Hufflepuff, a wise Ravenclaw, or a cunning Slytherin?
                </p>
                {/* Add house content here */}
            </section>

            <VirtualTourSection />
            <ContactUsSection />
            <Footer />

            {/* Floating Elements */}
            <FloatingElements />
        </div>
    );
}