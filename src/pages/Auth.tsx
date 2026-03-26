import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ArrowLeft } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }

      let profile: UserProfile;

      if (!userDoc?.exists()) {
        // Create new profile for Google user
        profile = {
          uid: user.uid,
          email: user.email || '',
          // Automatically make the requested email an admin
          role: user.email === 'rahilaabbasi7@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
        }
      } else {
        profile = userDoc.data() as UserProfile;
      }

      toast.success('Welcome to MS Fragrances!');
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        let userDoc;
        try {
          userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${userCredential.user.uid}`);
        }
        
        const profile = userDoc?.data() as UserProfile;
        
        toast.success('Welcome back!');
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        
        const profile: UserProfile = {
          uid: userCredential.user.uid,
          email: formData.email,
          // Automatically make the requested email an admin
          role: formData.email === 'rahilaabbasi7@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), profile);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
        
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-cream p-4 relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-luxury-gold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 shadow-2xl border border-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif tracking-widest mb-2">MS FRAGRANCES</h1>
          <p className="text-luxury-black/60 text-sm uppercase tracking-widest">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-luxury-black/10 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-luxury-black/10"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] uppercase tracking-widest text-luxury-black/40">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                required
                className="luxury-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              required
              className="luxury-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              className="luxury-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="luxury-button w-full mt-4"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase tracking-widest text-luxury-black/60 hover:text-luxury-gold transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
