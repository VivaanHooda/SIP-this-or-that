// src/utils/constants.js

// Vote Types
export const VOTE_TYPES = {
  SWITCH: 'switch',
  DONT_SWITCH: 'dontSwitch'
};

// Team Types
export const TEAM_TYPES = {
  A: 'A',
  B: 'B'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SPECTATOR: 'spectator'
};

// Debate Status
export const DEBATE_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  ADMIN_LOGIN: '/admin/login',
  SPECTATOR_JOIN: '/spectator/join',
  DASHBOARD: '/dashboard'
};

// Firebase Collections
export const FIREBASE_COLLECTIONS = {
  DEBATE: 'debate',
  TEAMS: 'teams',
  CLASSROOMS: 'classrooms',
  ROOMS: 'rooms', // Legacy compatibility
  VOTES: 'votes'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  USER_ROLE: 'userRole',
  IS_AUTHENTICATED: 'isAuthenticated',
  CURRENT_CLASSROOM: 'currentClassroom',
  ADMIN_DATA: 'adminData',
  VOTED_PREFIX: 'voted_' // Will be suffixed with classroom_id and team
};

// Default Values
export const DEFAULTS = {
  TOPIC: "Is technology making us less social?",
  VOTES: { switch: 0, dontSwitch: 0 },
  SPEAKING_FOR: 'A',
  TEAMS: { teamA: [], teamB: [] }
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  },
  TOPIC: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200
  },
  TEAM_SIZE: {
    MIN: 1,
    MAX: 20,
    RECOMMENDED_MAX_DIFFERENCE: 3
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  INVALID_PASSWORD: 'Invalid session password. Please check with the volunteer.',
  SESSION_EXPIRED: 'Your session has expired. Please rejoin.',
  ALREADY_VOTED: 'You have already voted in this round.',
  MISSING_CLASSROOM: 'Classroom ID is required.',
  INVALID_VOTE: 'Invalid vote type.',
  TEAMS_REQUIRED: 'Both teams need at least one member to start.',
  DATABASE_ERROR: 'Database error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  VOTE_SUBMITTED: 'Your vote has been recorded successfully.',
  DEBATE_STARTED: 'Debate session started successfully.',
  TOPIC_UPDATED: 'Debate topic updated successfully.',
  TEAMS_UPDATED: 'Teams updated successfully.',
  CLASSROOM_CREATED: 'Classroom created successfully.'
};

// API Endpoints
export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

// UI Constants
export const UI = {
  ANIMATION_DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1200
  },
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_TRANSITION: 250
};

// Feature Flags
export const FEATURES = {
  ENABLE_VOTE_HISTORY: true,
  ENABLE_TEAM_BALANCE_WARNING: true,
  ENABLE_AUTO_SWITCH: false,
  ENABLE_ANONYMOUS_MODE: false,
  ENABLE_DEBATE_TIMER: false
};

// Demo Data
export const DEMO_DATA = {
  ADMIN_CODES: ['TEACHER2024', 'ADMIN123', 'EDUCATOR'],
  SAMPLE_TOPICS: [
    "Is technology making us less social?",
    "Should homework be banned?",
    "Is social media more harmful than helpful?",
    "Should school uniforms be mandatory?",
    "Is online learning better than traditional classroom learning?"
  ],
  SAMPLE_NAMES: [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
    'Emma Brown', 'Frank Miller', 'Grace Taylor', 'Henry Clark'
  ]
};

// Export all constants as a single object for convenience
export const CONSTANTS = {
  VOTE_TYPES,
  TEAM_TYPES,
  USER_ROLES,
  DEBATE_STATUS,
  ROUTES,
  FIREBASE_COLLECTIONS,
  STORAGE_KEYS,
  DEFAULTS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
  UI,
  FEATURES,
  DEMO_DATA
};

export default CONSTANTS;