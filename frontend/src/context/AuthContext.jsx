import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const getStoredUser = () => {
  const user = window.localStorage.getItem('mobooka_user');
  const token = window.localStorage.getItem('mobooka_token');
  if (!user || !token) return { user: null, token: null };
  return { user: JSON.parse(user), token };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser().user);
  const [token, setToken] = useState(getStoredUser().token);

  useEffect(() => {
    if (user && token) {
      window.localStorage.setItem('mobooka_user', JSON.stringify(user));
      window.localStorage.setItem('mobooka_token', token);
    } else {
      window.localStorage.removeItem('mobooka_user');
      window.localStorage.removeItem('mobooka_token');
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
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
