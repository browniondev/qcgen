// pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

export default function AuthCallback() {
  const router = useRouter();
  const { token } = router.query;
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!token || typeof token !== "string") {
          throw new Error("No token received");
        }

        // Store the token in cookie
        Cookies.set("token", token, {
          expires: 1, // 1 day
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Get user data from token
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));

        // Store user ID
        Cookies.set("userId", payload.userId, {
          expires: 1,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Redirect to the stored redirect URL or default to home
        const redirectUrl = "/";
        localStorage.removeItem("redirectUrl"); // Clean up

        router.push(redirectUrl);
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.push("/signin?error=Authentication failed");
      }
    };

    if (token) {
      handleCallback();
    }
  }, [router, token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing login...</h2>
        {/* Optional: Add a loading spinner here */}
      </div>
    </div>
  );
}
