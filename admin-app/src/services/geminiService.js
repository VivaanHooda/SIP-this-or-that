// Gemini API call for unique key generation
export async function createRoomWithGemini() {
  // Replace with actual Gemini API call
  // For now, generate a random 6-digit key
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
// Gemini API service for generating debate-related passwords
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCT33ONf8J1povWiKDGSigwPkg4lQr8ao8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateDebatePassword = async () => {
  try {
    const prompt = `Generate a unique, memorable password for a classroom debate session. 
    Requirements:
    - Should be related to debating, public speaking, or critical thinking
    - Include 2-3 random numbers
    - Be 8-12 characters long
    - Easy to remember and type
    - No special characters that might cause input issues
    
    Examples of good passwords: "rhetoric42", "eloquence7", "debate2024"
    
    Return only the password, nothing else.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPassword = data.candidates[0].content.parts[0].text.trim();
    
    // Fallback if API fails or returns unexpected format
    if (!generatedPassword || generatedPassword.length < 6) {
      return generateFallbackPassword();
    }

    return generatedPassword;
  } catch (error) {
    console.error('Error generating password with Gemini:', error);
    // Fallback to local generation if API fails
    return generateFallbackPassword();
  }
};

// Fallback password generation if Gemini API fails
const generateFallbackPassword = () => {
  const debateWords = [
    'rhetoric', 'eloquence', 'debate', 'argument', 'logic', 'reason',
    'persuasion', 'discourse', 'dialogue', 'discussion', 'analysis',
    'critical', 'thinking', 'public', 'speaking', 'presentation'
  ];
  
  const randomWord = debateWords[Math.floor(Math.random() * debateWords.length)];
  const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${randomWord}${randomNumbers}`;
};

// Validate password format
export const validatePassword = (password) => {
  return password && password.length >= 6 && password.length <= 20;
};

// Create a new classroom with password
export const createClassroom = async (classroomData) => {
  try {
    const { name, password, adminName, topic } = classroomData;
    
    // Check if password already exists
    const existingClassroom = await getClassroomByPassword(password);
    if (existingClassroom) {
      throw new Error('This password is already in use. Please generate a new one.');
    }
    
    const classroomRef = doc(collection(db, 'classrooms'));
    const classroom = {
      id: classroomRef.id,
      name,
      password,
      adminName,
      topic: topic || 'Is technology making us less social?',
      createdAt: new Date().toISOString(),
      isActive: true,
      debateStarted: false,
      teamA: [],
      teamB: [],
      votes: { switch: 0, dontSwitch: 0 },
      speakingFor: 'A'
    };
    
    await setDoc(classroomRef, classroom);
    
    // Also create the debate and teams documents for this classroom
    await setDoc(doc(db, 'debate', classroomRef.id), {
      topic: classroom.topic,
      votes: classroom.votes,
      speakingFor: classroom.speakingFor,
      debateStarted: classroom.debateStarted
    });
    
    await setDoc(doc(db, 'teams', classroomRef.id), {
      teamA: classroom.teamA,
      teamB: classroom.teamB
    });
    
    return classroom;
  } catch (error) {
    console.error('Error creating classroom:', error);
    throw error;
  }
};

// Get classroom by password
export const getClassroomByPassword = async (password) => {
  try {
    const q = query(collection(db, 'classrooms'), where('password', '==', password));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting classroom by password:', error);
    throw error;
  }
};

// Get classroom by ID
export const getClassroomById = async (classroomId) => {
  try {
    const docRef = doc(db, 'classrooms', classroomId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting classroom by ID:', error);
    throw error;
  }
};

// Update classroom data
export const updateClassroom = async (classroomId, updates) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    await setDoc(classroomRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating classroom:', error);
    throw error;
  }
};

// Get all classrooms for an admin
export const getAdminClassrooms = async (adminName) => {
  try {
    const q = query(collection(db, 'classrooms'), where('adminName', '==', adminName));
    const querySnapshot = await getDocs(q);
    
    const classrooms = [];
    querySnapshot.forEach((doc) => {
      classrooms.push({ id: doc.id, ...doc.data() });
    });
    
    return classrooms;
  } catch (error) {
    console.error('Error getting admin classrooms:', error);
    throw error;
  }
};
