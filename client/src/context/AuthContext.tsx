import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import {User, AuthState} from '../types/auth';

export const AuthContext = createContext<{
  isSignedIn: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({
  isSignedIn: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsSignedIn(!!token);
  };

  const signIn = async (token: string) => {
    await AsyncStorage.setItem('token', token);
    setIsSignedIn(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{isSignedIn, signIn, signOut}}>
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
