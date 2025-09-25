import { useState, useEffect } from "react";

export const useAuthToken = () => {
  const [hasToken, setHasToken] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setHasToken(true);
          setUser(data.data.user);
        } else {
          setHasToken(false);
          setUser(null);
        }
      } catch {
        setHasToken(false);
        setUser(null);
      }
      finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { hasToken, user, loading };
};
