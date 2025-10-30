"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/contexts/AuthContext";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // Redirect logged-in users to dashboard
    } else {
      router.push("/login"); // Redirect guests to login
    }
  }, [user]);

  return <div>Loading...</div>;
}
