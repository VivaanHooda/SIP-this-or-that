// functions/index.js

// --- 1. Imports ---
// Import the Firebase Functions SDK and Express
const functions = require("firebase-functions");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// --- 2. CORS Configuration ---
// Set up CORS to allow requests from your frontend.
// The `origin: true` allows all origins for simplicity in development.
app.use(cors({origin: true}));

// Set up the Socket.io server with CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Allows all origins for real-time communication
    methods: ["GET", "POST"],
  },
});

// --- 3. Game State (The "single source of truth") ---
const gameState = {
  topic: "Is technology making us less social?",
  teamA: ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5"],
  teamB: ["Student 6", "Student 7", "Student 8", "Student 9", "Student 10"],
  speakingFor: "A",
  votes: {
    switch: 0,
    dontSwitch: 0,
  },
  // Use a Set to store socket IDs of voters for a simple check
  votedSpectators: new Set(),
};

// --- 4. Socket.io Event Handlers (The "game logic") ---
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send the current game state to the new client
  socket.emit("currentGameState", gameState);

  // Handle a spectator's vote
  socket.on("submitVote", (voteType) => {
    // Prevent multiple votes from the same spectator
    if (gameState.votedSpectators.has(socket.id)) {
      return;
    }

    if (voteType === "switch" || voteType === "dontSwitch") {
      gameState.votes[voteType]++;
      gameState.votedSpectators.add(socket.id);

      // Broadcast the updated state to ALL clients
      io.emit("gameStateUpdated", gameState);
    }
  });

  // Handle an admin-triggered side switch
  socket.on("adminSwitchSides", () => {
    gameState.speakingFor = gameState.speakingFor === "A" ? "B" : "A";
    // Reset votes for the new round
    gameState.votes = {switch: 0, dontSwitch: 0};
    gameState.votedSpectators.clear();
    io.emit("gameStateUpdated", gameState);
  });

  // Handle an admin setting a new topic
  socket.on("adminSetTopic", (newTopic) => {
    gameState.topic = newTopic;
    gameState.speakingFor = "A"; // Reset to default
    gameState.votes = {switch: 0, dontSwitch: 0};
    gameState.votedSpectators.clear();
    io.emit("gameStateUpdated", gameState);
  });

  // Handle a user disconnecting
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    gameState.votedSpectators.delete(socket.id);
  });
});

// --- 5. Export the Express app as a Firebase Function ---
// This makes your backend accessible via a public URL provided by Firebase.
exports.app = functions.https.onRequest(app);
