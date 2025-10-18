"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const GA_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "264062651955-8qamru5vjtu9kc1tr2trsgte5e10hm0m.apps.googleusercontent.com";
  return <GoogleOAuthProvider clientId={GA_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
