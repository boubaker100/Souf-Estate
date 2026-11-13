import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRoute({ children }) {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get("/api/me");
        setRole(res.data.role);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRole();
  }, [user]);

  if (!isLoaded || loading) return <div>Checking permissions...</div>;

  // Not logged in → redirect to Clerk sign-in
  if (!user) return <RedirectToSignIn />;

  // Logged in but not admin → redirect to home
  if (role !== "ADMIN") return <Navigate to="/" />;

  // Admin → render protected content
  return children;
}
