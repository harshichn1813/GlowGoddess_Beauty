// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"
import { 
    collection, 
    getDocs, getDoc,
    addDoc, 
    deleteDoc,  
    doc,
    query,
    where,
    setDoc,
    updateDoc,
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7U6OriOuc1fF_TU9WQuP9u-LgvoMdOfU",
  authDomain: "ecommercesite-281b8.firebaseapp.com",
  projectId: "ecommercesite-281b8",
  storageBucket: "ecommercesite-281b8.firebasestorage.app",
  messagingSenderId: "1000805948385",
  appId: "1:1000805948385:web:f5d386640c681ac2e050a0",
  measurementId: "G-GBECD39ZFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase Modules

export { auth, db, storage, collection, getDocs, addDoc, setDoc, orderBy,deleteDoc,updateDoc, doc,query,where, serverTimestamp ,getDoc};



