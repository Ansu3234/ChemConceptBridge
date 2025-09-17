import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
   apiKey: "AIzaSyBzKcGznYy-8y3hm2VTuAWhOK6op4VcgtA",
  authDomain: "chemconceptbridge.firebaseapp.com",
  projectId: "chemconceptbridge",
  storageBucket: "chemconceptbridge.firebasestorage.app",
  messagingSenderId: "124910351562",
  appId: "1:124910351562:web:8a80846ee10e8aff923033",
  measurementId: "G-2VXPV30PDB"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };