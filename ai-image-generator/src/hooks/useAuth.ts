import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
    createUserWithEmailAndPassword,
    signInAnonymously as firebaseSignInAnonymously,
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '../store/appStore';

// Configure Google Sign-In for Firebase
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser: setStoreUser } = useAppStore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: User | null) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        };
        setUser(authUser);
        setStoreUser(authUser);
      } else {
        setUser(null);
        setStoreUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [setStoreUser]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Configure Google Sign-In
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      return userCredential.user;
    } catch (error: any) {
      console.error('Google Sign-In Error:', JSON.stringify(error, null, 2));
      throw new Error('Google ile giriş yapılırken bir hata oluştu.');
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple ile giriş sadece iOS cihazlarda desteklenir.');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create an Apple credential with the token
      const { identityToken } = credential;
      if (identityToken) {
        const appleCredential = new OAuthProvider('apple.com').credential({
          idToken: identityToken,
        });

        // Sign-in the user with the credential
        const userCredential = await signInWithCredential(auth, appleCredential);
        return userCredential.user;
      }
      throw new Error('Apple kimlik belirteci alınamadı.');
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Apple ile giriş iptal edildi.');
      }
      throw new Error('Apple ile giriş yapılırken bir hata oluştu.');
    }
  };

  const signInAnonymously = async () => {
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      return userCredential.user;
    } catch (error: any) {
      throw new Error('Misafir girişi yapılırken bir hata oluştu.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Sign out from Google if user was signed in with Google
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser) {
        await GoogleSignin.signOut();
      }
    } catch (error: any) {
      throw new Error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  return {
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInAnonymously,
    logout,
  };
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
    case 'auth/wrong-password':
      return 'Hatalı şifre girdiniz.';
    case 'auth/email-already-in-use':
      return 'Bu email adresi zaten kullanımda.';
    case 'auth/weak-password':
      return 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
    case 'auth/invalid-email':
      return 'Geçersiz email adresi.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};