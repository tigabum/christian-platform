import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import {User, AuthState} from '../types/auth';

export const AuthContext = createContext<{
  isSignedIn: boolean;
  user: User | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      await signOut();
    }
  };

  const signIn = async (token: string) => {
    await AsyncStorage.setItem('token', token);
    await checkToken();
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{isSignedIn, user, signIn, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
