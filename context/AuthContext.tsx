import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: false,
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with guest user and set token immediately
  const [user, setUser] = useState<User | null>(() => {
    const guest = {
      email: 'guest@example.com',
      name: 'Guest Candidate',
      uid: 'guest-123'
    };
    localStorage.setItem('token', 'guest-token');
    return guest;
  });
  
  const [loading] = useState(false);

  useEffect(() => {
    // Keep sync in case user state changes externally
    if (user) {
      localStorage.setItem('token', 'guest-token');
    } else {
      localStorage.removeItem('token');
    }
  }, [user]);

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);