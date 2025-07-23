# 🧙‍♂️ Wizarding World Experience – An Immersive Harry Potter Universe

> A magical, AI-powered digital platform that fuses **3D experiences**, **real-time gameplay**, **personality-driven sorting**, and **cutting-edge AI tools** to bring Hogwarts to life like never before.

---

## 🎯 Vision

- Immerse users into a dynamic, interactive Hogwarts experience  
- Combine **gamification**, **AI**, **education**, and **social features**  
- Scalable platform built using modern frontend/backend + AI + 3D tools  

---

## 🛠️ Core Features & Modules

### 🧭 Landing Page & Virtual Tour
- Built with **Three.js** for immersive 3D environment
- **Character Section**: View iconic HP characters in 3D
- **Virtual Tour**: Navigate different parts of *Hogwarts Castle*

---

### 🔐 Auth System
- **Login / Signup**: Secured with **bcrypt** and **JWT**
- **Post-Registration**: Triggered **Sorting Hat Quiz**

---

### 🧠 House Sorting Quiz
- AI-enhanced quiz based on personality traits
- Allots users into one of the four houses (Gryffindor, Ravenclaw, Hufflepuff, Slytherin)
- House assignment is stored and reflected in user profile

---

### ✨ Spell Casting System
- **Wand + Hand Tracking** using **OpenCV** and **MediaPipe**
- Different colored spells triggered by gestures
- Real-time feedback and animations

---

### 📰 Daily Prophet (AI News)
- **Gemini API** generates magical news in real-time
- Topics: Dark Arts, Ministry Updates, Quidditch & more
- News feed stored in **MongoDB** with scrollable UI

---

### 📚 AI Librarian (Restricted Section)
- Ask any lore-based question
- Powered by **Gemini AI**
- Available 24/7 to assist magical learners

---

### 🗺️ Marauder’s Map
- Live **user location tracking** using **Leaflet.js + Geolocation API**
- Activation spell: `"I solemnly swear that I am up to no good"`
- Real-time visibility into who’s exploring what in Hogwarts

---

### 🧙‍♂️ Transfiguration Magic
- **Magical Photo Effects**:
  - **Remove backgrounds** using `rembg`
  - **Sketch-style renderings**
  - Gemini-powered image transformation suggestions
- Users can upload selfies and receive enchanted outputs

---

### ⚗️ Potion Brewing Game
- Built using **Phaser.js**
- Drag & drop ingredients
- Modes: *Guided Recipe* vs *Freestyle Experiment*
- Visual potion FX with timers and success/failure outcomes

---

### 📖 Tom Riddle’s AI Diary
- Diary interface mimics handwritten ink animation
- AI-powered chat with “Tom Riddle” persona (via Gemini)
- Unlocks secrets and storylines as interaction deepens

---

## 🧩 Tech Stack Overview

### 💻 Frontend
- `React 18`, `Three.js`, `Framer Motion`, `Tailwind CSS`
- `Leaflet.js`: Real-time map rendering
- `Phaser.js`: Potion brewing game

### 🧠 AI/ML Services
- `Gemini API`: News generation, AI librarian, diary responses
- `OpenCV + MediaPipe`: Wand gesture detection
- `TensorFlow.js`: Real-time spell visualizations
- `rembg`: Background removal in Transfiguration

### ⚙️ Backend
- `Node.js + Express.js`: Core backend API
- `MongoDB`: User data, news feed, quiz results
- `JWT + bcrypt`: Secure authentication
- `Python Flask`: AI service bridge (for image tasks, diary logic)

---

## 📁 Folder Structure (Simplified)

