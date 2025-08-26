import { db } from './firebase';
import { 
  doc, 
  addDoc,
  getDoc, 
  setDoc,
  onSnapshot,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

// Helper function to handle Firebase errors
const handleFirebaseError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  
  if (error.code === 'permission-denied') {
    throw new Error('Access denied. Please check your permissions or try refreshing the page.');
  } else if (error.code === 'unavailable') {
    throw new Error('Service temporarily unavailable. Please check your internet connection.');
  } else if (error.code === 'not-found') {
    throw new Error('Requested data not found.');
  }
  
  throw error;
};

// Get teams for a classroom
export const getTeams = async (classroomId) => {
  try {
    const teamsRef = doc(db, 'teams', classroomId || 'current');
    const teamsSnap = await getDoc(teamsRef);
    
    if (teamsSnap.exists()) {
      return teamsSnap.data();
    } else {
      const defaultTeams = { teamA: [], teamB: [], lastUpdated: new Date().toISOString() };
      
      // Try to create default teams data
      try {
        await setDoc(teamsRef, defaultTeams);
      } catch (setError) {
        console.warn('Could not create default teams data:', setError);
      }
      
      return defaultTeams;
    }
  } catch (error) {
    console.error('Error getting teams:', error);
    // Return default data on error
    return { teamA: [], teamB: [] };
  }
};

// Listen to real-time team updates
export const subscribeToTeams = (classroomId, callback) => {
  const teamsRef = doc(db, 'teams', classroomId || 'current');
  
  return onSnapshot(teamsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ teamA: [], teamB: [] });
    }
  }, (error) => {
    console.error('Error listening to teams:', error);
    // Call callback with default data on error
    callback({ teamA: [], teamB: [] });
  });
};

// Register a new student and automatically assign to a team
export const registerStudent = async (classroomId, studentData) => {
  try {
    const { name, admissionNumber } = studentData;
    
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }
    
    // Get current teams data
    const teamsRef = doc(db, 'teams', classroomId);
    const teamsSnap = await getDoc(teamsRef);
    
    let currentTeams = { teamA: [], teamB: [] };
    if (teamsSnap.exists()) {
      currentTeams = teamsSnap.data();
    }
    
    // Ensure teams arrays exist
    if (!Array.isArray(currentTeams.teamA)) currentTeams.teamA = [];
    if (!Array.isArray(currentTeams.teamB)) currentTeams.teamB = [];
    
    // Check for duplicate admission numbers
    const allStudents = [...currentTeams.teamA, ...currentTeams.teamB];
    const existingStudent = allStudents.find(student => 
      student.admissionNumber?.toLowerCase() === admissionNumber.toLowerCase()
    );
    
    if (existingStudent) {
      throw new Error('Student with this admission number is already registered');
    }
    
    // Check for duplicate names (case-insensitive)
    const existingName = allStudents.find(student => 
      student.name?.toLowerCase() === name.toLowerCase()
    );
    
    if (existingName) {
      throw new Error('A student with this name is already registered');
    }
    
    // Create student object
    const student = {
      name,
      admissionNumber,
      joinedAt: new Date().toISOString()
    };
    
    // Determine which team to assign to (alternate for balance)
    const teamACount = currentTeams.teamA.length;
    const teamBCount = currentTeams.teamB.length;
    
    let assignedTeam;
    let teamPosition;
    
    if (teamACount <= teamBCount) {
      // Assign to Team A
      assignedTeam = 'A';
      currentTeams.teamA.push(student);
      teamPosition = currentTeams.teamA.length;
    } else {
      // Assign to Team B
      assignedTeam = 'B';
      currentTeams.teamB.push(student);
      teamPosition = currentTeams.teamB.length;
    }
    
    // Update teams in database
    await setDoc(teamsRef, {
      ...currentTeams,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    // Also update the students collection for easy querying
    const studentsRef = doc(db, 'students', `${classroomId}_${admissionNumber}`);
    await setDoc(studentsRef, {
      ...student,
      classroomId,
      assignedTeam,
      teamPosition
    });
    
    return {
      success: true,
      assignedTeam,
      teamPosition,
      totalStudents: teamACount + teamBCount + 1
    };
    
  } catch (error) {
    handleFirebaseError(error, 'registerStudent');
  }
};

// Get student by admission number and classroom
export const getStudent = async (classroomId, admissionNumber) => {
  try {
    const studentRef = doc(db, 'students', `${classroomId}_${admissionNumber}`);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return studentSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting student:', error);
    return null;
  }
};

// Get all students in a classroom with better error handling
export const getClassroomStudents = async (classroomId) => {
  try {
    if (!classroomId) {
      console.warn('getClassroomStudents called without classroomId');
      return [];
    }
    
    const q = query(
      collection(db, 'students'), 
      where('classroomId', '==', classroomId)
    );
    const querySnapshot = await getDocs(q);
    
    const students = [];
    querySnapshot.forEach((doc) => {
      students.push(doc.data());
    });
    
    return students;
  } catch (error) {
    console.error('Error getting classroom students:', error);
    // Return empty array instead of throwing error to prevent app crash
    return [];
  }
};

// Update debate topic (Admin only)
export const updateTopicInGame = async (classroomId, gameId, newTopic) => {
  try {
    if (!classroomId || !gameId || !newTopic) {
      throw new Error('Classroom ID, Game ID, and topic are required');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    
    await updateDoc(gameDocRef, {
      topic: newTopic,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'updateTopicInGame');
  }
};

// Start debate (Admin only)
// Corrected version
export const startGame = async (classroomId, gameId) => { // 👈 gameId was missing
  try {
    if (!classroomId || !gameId) {
      throw new Error('Classroom ID and Game ID are required');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    
    await updateDoc(gameDocRef, {
      status: 'live',
      votes: { switch: 0, dontSwitch: 0 },
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'startGame');
  }
};
// Switch sides (Admin only)
export const switchSidesInGame = async (classroomId,gameId) => {
  try {
    if (!classroomId || !gameId) {
      throw new Error('Classroom ID is required');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    const gameSnap = await getDoc(gameDocRef);
    
    if (gameSnap.exists()) {
      const currentData = gameSnap.data();
      const newSpeakingFor = currentData.speakingFor === 'A' ? 'B' : 'A';
      
      await updateDoc(gameDocRef, {
        speakingFor: newSpeakingFor,
        votes: { switch: 0, dontSwitch: 0 }, // Reset votes on switch
        lastUpdated: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    handleFirebaseError(error, 'switchSidesInGame');
  }
};

// Update teams (Admin only) - Modified to work with student objects
export const updateTeams = async (classroomId, teamA, teamB) => {
  try {
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }
    
    const teamsRef = doc(db, 'teams', classroomId);
    await setDoc(teamsRef, {
      teamA: teamA || [],
      teamB: teamB || [],
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'updateTeams');
  }
};

// Remove student from team (Admin only)
export const removeStudentFromTeam = async (classroomId, studentAdmissionNumber) => {
  try {
    if (!classroomId || !studentAdmissionNumber) {
      throw new Error('Classroom ID and student admission number are required');
    }
    
    const teamsRef = doc(db, 'teams', classroomId);
    const teamsSnap = await getDoc(teamsRef);
    
    if (!teamsSnap.exists()) {
      throw new Error('Teams data not found');
    }
    
    const currentTeams = teamsSnap.data();
    
    // Ensure teams arrays exist
    if (!Array.isArray(currentTeams.teamA)) currentTeams.teamA = [];
    if (!Array.isArray(currentTeams.teamB)) currentTeams.teamB = [];
    
    // Find and remove student from appropriate team
    const teamAFiltered = currentTeams.teamA.filter(
      student => student.admissionNumber !== studentAdmissionNumber
    );
    const teamBFiltered = currentTeams.teamB.filter(
      student => student.admissionNumber !== studentAdmissionNumber
    );
    
    // Update teams
    await setDoc(teamsRef, {
      teamA: teamAFiltered,
      teamB: teamBFiltered,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    // Remove from students collection
    const studentRef = doc(db, 'students', `${classroomId}_${studentAdmissionNumber}`);
    try {
      await setDoc(studentRef, {}, { merge: false }); // This effectively deletes the document
    } catch (deleteError) {
      console.warn('Could not delete student document:', deleteError);
      // Continue anyway since team removal was successful
    }
    
    return true;
  } catch (error) {
    handleFirebaseError(error, 'removeStudentFromTeam');
  }
};

// Clear all teams (Admin only)
export const clearAllTeams = async (classroomId) => {
  try {
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }
    
    // Clear teams
    const teamsRef = doc(db, 'teams', classroomId);
    await setDoc(teamsRef, {
      teamA: [],
      teamB: [],
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    // Get all students in classroom and remove them
    try {
      const students = await getClassroomStudents(classroomId);
      const deletePromises = students.map(student => {
        const studentRef = doc(db, 'students', `${classroomId}_${student.admissionNumber}`);
        return setDoc(studentRef, {}, { merge: false });
      });
      
      await Promise.all(deletePromises);
    } catch (deleteError) {
      console.warn('Some student documents could not be deleted:', deleteError);
      // Continue anyway since team clearing was successful
    }
    
    return true;
  } catch (error) {
    handleFirebaseError(error, 'clearAllTeams');
  }
};

// Submit a vote (Spectator only)
// New, refactored version
export const submitVoteInGame = async (classroomId, gameId, voteType) => {
  try {
    if (!classroomId || !gameId || !voteType) {
      throw new Error('Classroom ID, Game ID, and vote type are required');
    }
    
    if (!['switch', 'dontSwitch'].includes(voteType)) {
      throw new Error('Invalid vote type');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    
    // Use Firestore's increment function for atomic updates
    await updateDoc(gameDocRef, {
      [`votes.${voteType}`]: increment(1),
      lastUpdated: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    handleFirebaseError(error, 'submitVoteInGame');
  }
};
// Get classroom by password
export const getClassroomByPassword = async (password) => {
  try {
    if (!password) {
      throw new Error('Password is required');
    }
    
    const q = query(collection(db, 'classrooms'), where('password', '==', password));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting classroom by password:', error);
    return null;
  }
};

// Verify classroom exists and is active
export const verifyClassroom = async (classroomId) => {
  try {
    if (!classroomId) {
      return false;
    }
    
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (classroomSnap.exists()) {
      const data = classroomSnap.data();
      return data.isActive !== false; // Default to true if not specified
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying classroom:', error);
    return false;
  }
};

// Save room details (Legacy function for compatibility)
export const saveRoomDetails = async (roomKey, details) => {
  try {
    if (!roomKey || !details) {
      throw new Error('Room key and details are required');
    }
    
    const roomRef = doc(db, 'rooms', roomKey);
    await setDoc(roomRef, {
      ...details,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving room details:', error);
    throw error;
  }
};

// Listen to votes (Legacy function for compatibility)
export const listenToVotes = (roomKey, callback) => {
  if (!roomKey || !callback) {
    console.error('listenToVotes requires roomKey and callback');
    return () => {}; // Return empty unsubscribe function
  }
  
  const roomRef = doc(db, 'rooms', roomKey);
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.votes || {});
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Error listening to votes:', error);
    callback({}); // Call callback with empty object on error
  });
};
// New, refactored version
export const updateTimerInGame = async (classroomId, gameId, newTime, isRunning) => {
  try {
    if (!classroomId || !gameId) {
      throw new Error('Classroom ID and Game ID are required');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    
    await updateDoc(gameDocRef, {
      timer: newTime,
      isTimerRunning: isRunning,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'updateTimerInGame');
  }
};
export const createGame = async (classroomId, gameData) => {
  try {
    if (!classroomId || !gameData) {
      throw new Error('Classroom ID and game data are required.');
    }

    // This creates a reference to the new "games" subcollection
    const gamesCollectionRef = collection(db, 'classrooms', classroomId, 'games');

    const newGame = {
      gameName: gameData.gameName || 'New Game',
      topic: gameData.topic || 'Topic to be decided.',
      teamAPlayers: gameData.teamAPlayers || [],
      teamBPlayers: gameData.teamBPlayers || [],
      status: 'waiting', // "waiting", "live", "finished"
      votes: { switch: 0, dontSwitch: 0 },
      timer: 300,
      isTimerRunning: false,
      speakingFor: 'A',
      createdAt: new Date().toISOString()
    };

    // This adds a new document to the "games" subcollection with an auto-generated ID
    const docRef = await addDoc(gamesCollectionRef, newGame);

    return { id: docRef.id, ...newGame }; // Return the new game with its ID
  } catch (error) {
    handleFirebaseError(error, 'createGame');
  }
};
export const subscribeToGamesList = (classroomId, callback) => {
  try {
    const gamesCollectionRef = collection(db, 'classrooms', classroomId, 'games');
    
    // onSnapshot listens for any changes in the collection
    return onSnapshot(gamesCollectionRef, (querySnapshot) => {
      const games = [];
      querySnapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() });
      });
      callback(games); // Send the updated list of games to the app
    });
  } catch (error) {
    console.error("Error subscribing to games list:", error);
    return () => {}; // Return an empty unsubscribe function on error
  }
};
export const deleteGame = async (classroomId, gameId) => {
  try {
    if (!classroomId || !gameId) {
      throw new Error('Classroom ID and Game ID are required.');
    }
    
    const gameDocRef = doc(db, 'classrooms', classroomId, 'games', gameId);
    await deleteDoc(gameDocRef);
    
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteGame');
  }
};
