# IdeaSpace  
### _Put your thoughts on the board!_

---

## Overview  
IdeaSpace transforms **spoken commands** into **real-time whiteboard diagrams**, automatically generating shapes, workflows, and structured layouts.  
Powered by a **Node.js backend**, a **React + Tldraw frontend**, and **OpenAI real-time models**, the system listens to your voice, interprets it, and produces clean diagrams instantly.

---

## Features  
-  **Real-Time Speech → Diagram** — Speak your ideas and watch them appear on the board.  
-  **AI-Generated Workflow** — Turns natural language into connected flowchart elements.  
-  **React + Tldraw Frontend** — Smooth, intuitive drawing interface.  
-  **Node.js / Express Backend** — Handles AI requests, websockets, and communication.  
-  **OpenAI Real-Time API** — Intelligent layout and shape generation.  
-  **Modular Codebase** — Easily extendable for new shapes and features.

---

## Technologies Used  

### Frontend
- **React.js** — Component-based UI framework  
- **Vite** — Fast bundler and dev server  
- **Tldraw** — Interactive drawing tools + shape system  
- **JavaScript (ES6+)**  
- **CSS3 / HTML5**  

### Backend
- **Node.js** — Server runtime  
- **Express.js** — Routing + middleware  
- **WebSockets (`ws`)** — Real-time streaming  
- **dotenv** — Environment variable management  

### AI / Machine Learning
- **OpenAI GPT-4o / GPT-4.1 Realtime** — Diagram reasoning + layout  
- **OpenAI Speech Recognition** — Converts microphone audio to text  
- **Streaming AI Architecture** — For real-time shape generation  

### Tooling
- **Git / GitHub**  
- **npm**  
- **Postman / Thunder Client** (optional)  
- **ESLint / Prettier** (optional)
- **Visual Studio Code**
---

## Installation Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/IdeaSpace.git
cd IdeaSpace
```
### 2️⃣ Install Backend

```bash
cd backend
npm install
```
create a .env file
```bash
OPENAI_API_KEY=your_api_key
```
Start backend

```bash
npm start
```

### 3️⃣ Install Frontend

```bash
cd ../frontend
npm install
npm run dev
```
### Usage Instrsuctions 

1. Start the ***Backend Server****
```bash
npm start
```

2. Start the ***Frontend***
```bash
npm run dev
```
3. Open the local URL ***(usually http://localhost:5173)***.
4. Click the microphone button and speak commands like:
- ***"Create a box labeled Backend.”***
- ***“Add a circle labeled API.”***
- ***“Draw an arrow from Backend to API.”***
5. Watch the AI generate shapes and connect them in real time.

## Contributing Guidelines

Contributions are welcome!

***Steps to contribute:***
1. Fork the repo
2. Create a Branch
```bash
git checkout -b feature-name
```
3. Commit your changes:
```bash
git commit -m "Add feature"
```
4. Push your branch
5. Open a Pull Request

Please keep PRs small, focused, and well-documented.

## License Information

This project is licensed under the ***MIT License.***

## Contact Information  

**Waheed Khan**  
- GitHub: https://github.com/waheedcan  
- Email: wahkha432@gmail.com  

**Aryan Khandelwal**  
- GitHub: https://github.com/a-khandel  
- Email: aryan.khandelwal.pro@gmail.com  

**Parsh Gandhi**  
- GitHub: https://github.com/parshg  
- Email: parsh.gandhi22@gmail.com  

**Madhu Vijaya Kumar**  
- GitHub: https://github.com/mvk05  
- Email: bvkmadhu22@gmail.com

## Acknowledgements
- OpenAI for real-time speech + diagram reasoning
- Tldraw for the collaborative whiteboard engine
- Whisper for high-accuracy real-time speech recognition


