import React, { createContext, useContext, useState, ReactNode } from "react";

// Typen für Benutzer
interface User {
  name: string;
  password?: string; // oder email, wenn du später Firebase Auth nutzt
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// Context erstellen
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider-Komponente
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook, damit du einfacher auf den UserContext zugreifen kannst
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
