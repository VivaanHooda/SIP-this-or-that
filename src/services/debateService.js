import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove
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

// Get current debate data for a classroom
export const getDebateData = async (classroomId) => {
  try {
    const debateRef = doc(db, 'debate', classroomId || 'current');
    const debateSnap = await getDoc(debateRef);
    
    if (debateSnap.exists()) {
      return debateSnap.data();
    } else {
      // Create default debate data if it doesn't exist
      const defaultData = {
        topic: "Is technology making us less social?",
        debateStarted: false,
        speakingFor: 'A',
        votes: { switch: 0, dontSwitch: 0 },
        lastUpdated: new Date().toISOString()
      };
      
      // Try to create the document
      try {
        await setDoc(debateRef, defaultData);
      } catch (setError) {
        console.warn('Could not create default debate data:', setError);
      }
      
      return defaultData;
    }
  } catch (error) {
    handleFirebaseError(error, 'getDebateData');
  }
};

// Listen to real-time debate updates
export const subscribeToDebate = (classroomId, callback) => {
  const debateRef = doc(db, 'debate', classroomId || 'current');
  
  return onSnapshot(debateRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      // Provide default data if document doesn't exist
      callback({
        topic: "Is technology making us less social?",
        debateStarted: false,
        speakingFor: 'A',
        votes: { switch: 0, dontSwitch: 0 }
      });
    }
  }, (error) => {
    console.error('Error listening to debate:', error);
    // Call callback with default data on error
    callback({
      topic: "Is technology making us less social?",
      debateStarted: false,
      speakingFor: 'A',
      votes: { switch: 0, dontSwitch: 0 }
    });
  });
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
export const updateTopic = async (classroomId, newTopic) => {
  try {
    if (!classroomId || !newTopic) {
      throw new Error('Classroom ID and topic are required');
    }
    
    const debateRef = doc(db, 'debate', classroomId);
    await updateDoc(debateRef, {
      topic: newTopic,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'updateTopic');
  }
};

// Start debate (Admin only)
export const startDebate = async (classroomId) => {
  try {
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }
    
    const debateRef = doc(db, 'debate', classroomId);
    await updateDoc(debateRef, {
      debateStarted: true,
      votes: { switch: 0, dontSwitch: 0 }, // Reset votes when starting
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'startDebate');
  }
};

// Switch sides (Admin only)
export const switchSides = async (classroomId) => {
  try {
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }
    
    const debateRef = doc(db, 'debate', classroomId);
    const debateSnap = await getDoc(debateRef);
    
    if (debateSnap.exists()) {
      const currentData = debateSnap.data();
      const newSpeakingFor = currentData.speakingFor === 'A' ? 'B' : 'A';
      
      await updateDoc(debateRef, {
        speakingFor: newSpeakingFor,
        votes: { switch: 0, dontSwitch: 0 }, // Reset votes when switching
        lastUpdated: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    handleFirebaseError(error, 'switchSides');
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
export const submitVote = async (classroomId, voteType) => {
  try {
    if (!classroomId || !voteType) {
      throw new Error('Classroom ID and vote type are required');
    }
    
    if (!['switch', 'dontSwitch'].includes(voteType)) {
      throw new Error('Invalid vote type');
    }
    
    const debateRef = doc(db, 'debate', classroomId);
    
    // Use Firestore's increment function for atomic updates
    await updateDoc(debateRef, {
      [`votes.${voteType}`]: increment(1),
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Vote submitted successfully:', voteType);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'submitVote');
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
export const updateTimer = async (classroomId, newTime, isRunning) => {
  try {
    const debateRef = doc(db, 'debate', classroomId);
    await updateDoc(debateRef, {
      timer: newTime,
      isTimerRunning: isRunning,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirebaseError(error, 'updateTimer');
  }
};
