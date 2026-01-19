import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwQNS9uWUtBYMqUKb2wWFtpZLNLW97Hwg",
  authDomain: "intellection-classboard-b2ee6.firebaseapp.com",
  projectId: "intellection-classboard-b2ee6",
  storageBucket: "intellection-classboard-b2ee6.firebasestorage.app",
  messagingSenderId: "36437442866",
  appId: "1:36437442866:web:9359f6c84d71a5dc56d72b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveSessionData = async (branch, data) => {
  try {
    await setDoc(doc(db, 'sessions', branch), {
      sessions: data.sessions,
      adminMessage: data.adminMessage,
      lastUpdate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Erreur Firebase:', error);
    return false;
  }
};

export const loadSessionData = async (branch) => {
  try {
    const docRef = doc(db, 'sessions', branch);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (error) {
    return null;
  }
};

export const saveTimeOffset = async (offset) => {
  try {
    await setDoc(doc(db, 'settings', 'timeOffset'), { value: offset });
    return true;
  } catch (error) {
    return false;
  }
};

export const loadTimeOffset = async () => {
  try {
    const docRef = doc(db, 'settings', 'timeOffset');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data().value;
    return 0;
  } catch (error) {
    return 0;
  }
};

export { db };