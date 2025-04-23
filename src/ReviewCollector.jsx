import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Input = (props) => <input {...props} className="p-2 border rounded w-full" />;
const Button = ({ children, ...props }) => (
  <button {...props} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{children}</button>
);

export default function ReviewCollector() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('auth');

  useEffect(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setStep('start');
      }
    });

    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      if (storedEmail) {
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then((result) => {
            setUser(result.user);
            setStep('start');
          })
          .catch(console.error);
      }
    }
  }, []);

  const sendSignInLink = async () => {
    try {
      const actionCodeSettings = {
        url: 'https://smartreviewcollector.vercel.app',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('Sign-in link sent! Please check your email.');
    } catch (error) {
      console.error('Error sending login link:', error);
      alert('Failed to send login link. Make sure the email is valid and try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Smart Review Collector</h1>
      {step === 'auth' && (
        <div className="space-y-4">
          <Input
            placeholder="Enter your email to log in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Button onClick={sendSignInLink} disabled={!email.includes('@')}>
            Send Login Link
          </Button>
        </div>
      )}
      {step === 'start' && (
        <p className="text-center">You're logged in as {user?.email}</p>
      )}
    </div>
  );
}
