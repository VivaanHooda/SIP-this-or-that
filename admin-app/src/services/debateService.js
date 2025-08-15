import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Save room details (teams, topic) to Firestore
export async function saveRoomDetails(roomKey, { teams, topic }) {
  await setDoc(doc(db, 'rooms', roomKey), {
    teams,
    topic,
    createdAt: Date.now(),
  });
}

// Listen to votes for a room
export function listenToVotes(roomKey, setVotes) {
  return onSnapshot(doc(db, 'rooms', roomKey), (docSnap) => {
    const data = docSnap.data();
    setVotes(data && data.votes ? data.votes : {});
  });
}
// admin-app/src/services/debateService.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to create a new classroom
export const createClassroom = async (classroomData) => {
  const classroomRef = doc(collection(db, 'classrooms'));
  await setDoc(classroomRef, {
    ...classroomData,
    id: classroomRef.id,
    createdAt: new Date(),
    votes: { switch: 0, dontSwitch: 0 },
  });
  return { ...classroomData, id: classroomRef.id };
};

// Function to verify if a classroom exists and get its data
export const verifyClassroom = async (password) => {
  const q = query(collection(db, 'classrooms'), where('password', '==', password));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null; // No classroom found
  }
  const classroomDoc = querySnapshot.docs[0];
  return { id: classroomDoc.id, ...classroomDoc.data() };
};

// Function to update the debate teams and topic
export const updateDebate = async (classroomId, data) => {
  const classroomRef = doc(db, 'classrooms', classroomId);
  await updateDoc(classroomRef, data);
};

// Function to subscribe to a debate and get real-time updates
export const subscribeToDebate = (classroomId, callback) => {
  const classroomRef = doc(db, 'classrooms', classroomId);
  const unsubscribe = onSnapshot(classroomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      console.log("No such document!");
    }
  });
  return unsubscribe;
};