"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const publicPaths = new Set(["/login", "/register"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    const currentPath = pathname || "";
    const isPublic = publicPaths.has(currentPath);

    // Avoid redundant redirects and loops
    if (!isAuthenticated && !isPublic && lastRedirectRef.current !== "/login" && currentPath !== "/login") {
      lastRedirectRef.current = "/login";
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublic && lastRedirectRef.current !== "/dashboard" && currentPath !== "/dashboard") {
      lastRedirectRef.current = "/dashboard";
      router.replace("/dashboard");
      return;
    }

    lastRedirectRef.current = null;
  }, [isAuthenticated, loading, pathname, router]);

  return <>{children}</>;
}


