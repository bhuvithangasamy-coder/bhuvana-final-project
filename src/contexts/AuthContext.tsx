import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ApiService from "@/services/api";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
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
    // Validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      // Call API service
      const response = await ApiService.login(email, password);
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem("token", response.token);
        
        const newUser: User = {
          id: String(response.user.id),
          email: response.user.email,
          username: response.user.username,
        };
        
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    // Validation
    if (!email || !password || !username) {
      throw new Error("All fields are required");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (username.trim().length < 2) {
      throw new Error("Username must be at least 2 characters");
    }

    try {
      // Call API service
      const response = await ApiService.register(username, email, password);
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem("token", response.token);
        
        const newUser: User = {
          id: String(response.user.id),
          email: response.user.email,
          username: response.user.username,
        };
        
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
