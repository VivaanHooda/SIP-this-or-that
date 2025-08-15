// admin-app/src/services/debateService.js
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Document references
const DEBATE_DOC = 'debate';
const TEAMS_COLLECTION = 'teams';

// Initialize debate data in Firestore
export const initializeDebate = async () => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    const debateData = {
      topic: "Is technology making us less social?",
      debateStarted: false,
      speakingFor: 'A',
      votes: { switch: 0, dontSwitch: 0 },
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(debateRef, debateData);
    console.log('Debate initialized in Firestore');
    return debateData;
  } catch (error) {
    console.error('Error initializing debate:', error);
    throw error;
  }
};

// Get current debate data
export const getDebateData = async () => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    const debateSnap = await getDoc(debateRef);
    
    if (debateSnap.exists()) {
      return debateSnap.data();
    } else {
      // Initialize if doesn't exist
      return await initializeDebate();
    }
  } catch (error) {
    console.error('Error getting debate data:', error);
    throw error;
  }
};

// Listen to real-time debate updates
export const subscribeToDebate = (callback) => {
  const debateRef = doc(db, DEBATE_DOC, 'current');
  
  return onSnapshot(debateRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error('Error listening to debate:', error);
  });
};

// Update debate topic
export const updateTopic = async (newTopic) => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    await updateDoc(debateRef, {
      topic: newTopic,
      debateStarted: false,
      votes: { switch: 0, dontSwitch: 0 },
      lastUpdated: new Date().toISOString()
    });
    console.log('Topic updated:', newTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

// Start debate
export const startDebate = async () => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    await updateDoc(debateRef, {
      debateStarted: true,
      lastUpdated: new Date().toISOString()
    });
    console.log('Debate started');
  } catch (error) {
    console.error('Error starting debate:', error);
    throw error;
  }
};

// Switch sides
export const switchSides = async () => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    const currentData = await getDebateData();
    const newSpeakingFor = currentData.speakingFor === 'A' ? 'B' : 'A';
    
    await updateDoc(debateRef, {
      speakingFor: newSpeakingFor,
      votes: { switch: 0, dontSwitch: 0 },
      lastUpdated: new Date().toISOString()
    });
    console.log('Sides switched to Team', newSpeakingFor);
  } catch (error) {
    console.error('Error switching sides:', error);
    throw error;
  }
};

// Update teams
export const updateTeams = async (teamA, teamB) => {
  try {
    const teamsRef = doc(db, TEAMS_COLLECTION, 'current');
    await setDoc(teamsRef, {
      teamA,
      teamB,
      lastUpdated: new Date().toISOString()
    });
    console.log('Teams updated');
  } catch (error) {
    console.error('Error updating teams:', error);
    throw error;
  }
};

// Get teams
export const getTeams = async () => {
  try {
    const teamsRef = doc(db, TEAMS_COLLECTION, 'current');
    const teamsSnap = await getDoc(teamsRef);
    
    if (teamsSnap.exists()) {
      return teamsSnap.data();
    } else {
      return { teamA: [], teamB: [] };
    }
  } catch (error) {
    console.error('Error getting teams:', error);
    throw error;
  }
};

// Listen to real-time team updates
export const subscribeToTeams = (callback) => {
  const teamsRef = doc(db, TEAMS_COLLECTION, 'current');
  
  return onSnapshot(teamsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error('Error listening to teams:', error);
  });
};

// Update votes (called when spectators vote)
export const updateVotes = async (votes) => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    await updateDoc(debateRef, {
      votes,
      lastUpdated: new Date().toISOString()
    });
    console.log('Votes updated:', votes);
  } catch (error) {
    console.error('Error updating votes:', error);
    throw error;
  }
};
