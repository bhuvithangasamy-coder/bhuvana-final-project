import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simple validation (no backend)
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user object with email-based username
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username: email.split("@")[0],
    };

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (email: string, password: string, name: string) => {
    // Simple validation
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user object
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username: name.split(" ")[0].toLowerCase(),
    };

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
