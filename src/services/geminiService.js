import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {createGame} from './debateService';

// Use environment variable or fallback to your key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCT33ONf8J1povWiKDGSigwPkg4lQr8ao8';// Fixed API URL - use the correct endpoint
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Generate a debate-themed password using Gemini AI
export const generateDebatePassword = async () => {
  try {
    const prompt = `Generate a unique, memorable password for a classroom debate session. 
    Requirements:
    - Combine one random, simple English word with 2-3 random numbers.
    - The word should be related to debating, learning, or ideas.
    - Total length should be 8-12 characters.
    - Easy to remember and type.
    - No special characters.
    
    Examples: "logic481", "reason92", "idea583"
    
    Return only the password, nothing else.`;
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 50,
        },
      })
    });

    if (!response.ok) {
      console.error('Gemini API Response:', response.status, response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPassword = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    // Fallback if API fails or returns unexpected format
    if (!generatedPassword || generatedPassword.length < 6) {
      console.warn('Gemini returned invalid password, using fallback');
      return generateFallbackPassword();
    }

    // Clean up the password (remove quotes, newlines, etc.)
    const cleanPassword = generatedPassword.replace(/['"]/g, '').replace(/\s+/g, '');
    
    return cleanPassword || generateFallbackPassword();
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
    'critical', 'thinking', 'speaking', 'presentation', 'evidence'
  ];
  
  const randomWord = debateWords[Math.floor(Math.random() * debateWords.length)];
  const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${randomWord}${randomNumbers}`;
};

// Create a room with Gemini-generated password (Legacy function)
export const createRoomWithGemini = async () => {
  try {
    const password = await generateDebatePassword();
    // Return the password as the room key for legacy compatibility
    return password.toUpperCase();
  } catch (error) {
    console.error('Error creating room with Gemini:', error);
    throw error;
  }

};

// Validate password format
export const validatePassword = (password) => {
  return password && password.length >= 6 && password.length <= 20;
};

// Create a new classroom with password
export const createClassroom = async (classroomData) => {
  try {
    let password;
    let isUnique = false;
    let attempts = 0;

    // This loop will continue until a unique password is found
    while (!isUnique && attempts < 10) { // We'll add a safety limit of 10 tries
      password = await generateDebatePassword();
      const existingClassroom = await getClassroomByPassword(password);
      if (!existingClassroom) {
        // If no classroom is found with this password, it's unique!
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      // If we still couldn't find a unique password after 10 tries, use a fallback
      throw new Error('Failed to generate a unique password after multiple attempts.');
    }

    // --- The rest of the function continues as before ---
    const classroomRef = doc(collection(db, 'classrooms'));
    const classroom = {
      id: classroomRef.id,
      name: classroomData.name || 'Debate Classroom',
      password, // Use the guaranteed unique password
      adminName: classroomData.adminName || 'Teacher',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    await setDoc(classroomRef, classroom);
    if (classroomData.topic) {
      await createGame(classroom.id, {
        gameName: "Game 1",
        topic: classroomData.topic,
      });
    }
    
    return classroom;

  } catch (error) {
    console.error('Error creating classroom:', error);
    throw error; // Re-throw the error to be handled by the component
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
    await setDoc(classroomRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
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
const fallbackTopics = [
  "Should social media platforms be responsible for user-generated content?",
  "Are movie remakes ever better than the original?",
  "Is it acceptable to recline your seat on an airplane?",
  "Is artificial intelligence a threat to humanity?",
  "Streaming vs. Owning: Is it better to stream media (Netflix, Spotify) or own physical copies (Blu-rays, vinyl)?",
  "AI in Music: Should artists be allowed to use AI to create songs?",
];

export const generateDebateTopic = async () => {
  try {
    const prompt = `Generate a surprising and creative topic suitable for college students. Keep it funny! We are here to chill!
    Do not add any extra text, introduction, or quotation marks.
    No political or overly controversial topics. No topic to hurt the sentiments of any community.
    Keep it concise (under 100 characters). Topics focusing on light-hearted subjects like social mdeia, humour, pop culture, technology, movies, music, sports.
    Keep in mind this is an ice-breaker debate topic for college students.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 100,
        },
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedTopic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedTopic) {
      // If AI fails, pick a random topic from our fallback list
      return fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
    }

    return generatedTopic;
  } catch (error) {
    console.error('Error generating topic with Gemini:', error);
    // On any error, return a fallback topic
    return fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
  }
};