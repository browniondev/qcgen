// import React, { createContext, useState, useContext, useEffect } from "react";

// interface AuthContextType {
//   user: any;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   loginWithGoogle: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     // Check if user is logged in on mount
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/auth/check");
//         if (response.ok) {
//           const userData = await response.json();
//           setUser(userData);
//         }
//       } catch (error) {
//         console.error("Error checking authentication:", error);
//       }
//     };
//     checkAuth();
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" });
//       setUser(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   const loginWithGoogle = async () => {
//     // Implement Google OAuth login
//     // This would typically involve redirecting to a Google OAuth URL
//     window.location.href = "/api/auth/google";
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loginWithGoogle }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for authentication state from cookies on mount
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");
    const userEmail = Cookies.get("userEmail");

    if (token && userId && userEmail) {
      setUser({
        id: userId,
        email: userEmail,
      });
      router.push("/");
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("userEmail");
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();

      // Store authentication data in cookies
      // js-cookie automatically handles encoding/decoding of values
      Cookies.set("token", data.token, {
        expires: 30, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userId", data.user.id, {
        expires: 30,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();

      // Store authentication data in cookies
      // js-cookie automatically handles encoding/decoding of values
      Cookies.set("token", data.token, {
        expires: 30, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userId", data.user.id, {
        expires: 30,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });
    } catch (error) {
      console.error("signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    return Promise.resolve(handleLogout());
  };

  // const loginWithGoogle = async () => {
  //   localStorage.setItem("redirectUrl", window.location.pathname);
  //   window.location.href = `http://localhost:3000/api/auth/google`;
  // };
  const loginWithGoogle = async () => {
    try {
      // Store current path for redirect after login
      localStorage.setItem("redirectUrl", window.location.pathname);

      // Redirect to your backend Google OAuth endpoint
      window.location.href = "http://localhost:3000/api/auth/google";
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loginWithGoogle, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
