// spectator-app/src/services/debateService.js
import { 
  doc, 
  getDoc, 
  onSnapshot,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

// Document references
const DEBATE_DOC = 'debate';
const TEAMS_COLLECTION = 'teams';

// Get current debate data
export const getDebateData = async () => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    const debateSnap = await getDoc(debateRef);
    
    if (debateSnap.exists()) {
      return debateSnap.data();
    } else {
      return {
        topic: "Is technology making us less social?",
        debateStarted: false,
        speakingFor: 'A',
        votes: { switch: 0, dontSwitch: 0 }
      };
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

// Submit a vote (increment the vote count)
export const submitVote = async (voteType) => {
  try {
    const debateRef = doc(db, DEBATE_DOC, 'current');
    
    // Use Firestore's increment function for atomic updates
    await updateDoc(debateRef, {
      [`votes.${voteType}`]: increment(1),
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Vote submitted successfully:', voteType);
    return true;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};
