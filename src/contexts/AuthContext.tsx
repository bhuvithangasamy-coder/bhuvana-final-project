import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ApiService from "@/services/api";
import authService from "@/services/auth";

interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, isRecruiter?: boolean) => Promise<User>;
  register: (email: string, password: string, username: string, role?: string, isRecruiter?: boolean, phone_number?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
        }
      }

      if (token) {
        try {
          const response = await ApiService.getProfile();
          if (response.user) {
            const fetchedUser: User = {
              id: String(response.user.id),
              email: response.user.email,
              username: response.user.username,
              role: response.user.role,
              createdAt: response.user.created_at,
            };
            setUser(fetchedUser);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
          }
        } catch (error) {
          console.error("Failed to fetch fresh user profile:", error);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, isRecruiter: boolean = false) => {
    if (!email || !password) throw new Error("Email and password are required");
    if (!email.includes("@")) throw new Error("Please enter a valid email");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    try {
      const response = isRecruiter ? await authService.loginRecruiter(email, password) : await authService.createSession(email, password);
      
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        const newUser: User = {
          id: String(response.user.id),
          email: response.user.email,
          username: response.user.username,
          role: response.user.role,
          createdAt: response.user.created_at,
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, role?: string, isRecruiter?: boolean, phone_number?: string) => {
    if (!email || !password || !username) throw new Error("All fields are required");
    if (!email.includes("@")) throw new Error("Please enter a valid email");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    if (username.trim().length < 2) throw new Error("Name must be at least 2 characters");

    try {
      let response;
      if (isRecruiter) {
         response = await authService.registerRecruiter(username, email, password, phone_number || "");
      } else if (role === 'admin') {
         response = await ApiService.register(username, email, password, "admin");
      } else {
         response = await ApiService.register(username, email, password, role);
      }
      
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        const newUser: User = {
          id: String(response.user.id),
          email: response.user.email,
          username: response.user.username,
          role: response.user.role,
          createdAt: response.user.created_at,
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
