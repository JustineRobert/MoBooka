import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      const storedUser = await AsyncStorage.getItem('mobooka_user');
      const storedToken = await AsyncStorage.getItem('mobooka_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      setLoading(false);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      AsyncStorage.setItem('mobooka_user', JSON.stringify(user));
      AsyncStorage.setItem('mobooka_token', token);
    } else {
      AsyncStorage.removeItem('mobooka_user');
      AsyncStorage.removeItem('mobooka_token');
    }
  }, [user, token]);

  const signIn = (data) => {
    setUser(data.user);
    setToken(data.token);
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
