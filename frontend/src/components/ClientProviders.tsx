"use client";

import React, { useEffect, useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import AuthGate from "./AuthGate";
import Navbar from "./Navbar";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthGate>
        <Navbar />
        <main className="p-4">{children}</main>
      </AuthGate>
    </AuthProvider>
  );
}


