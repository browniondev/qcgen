import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.name || user.email}
      </h1>
      <p className="mb-4">
        You're logged in and can now use all features of our QR code generator.
      </p>
      <Button onClick={() => router.push("/")} className="mb-2">
        Go to QR Generator
      </Button>
      <Button onClick={logout} variant="outline">
        Log out
      </Button>
    </div>
  );
}
