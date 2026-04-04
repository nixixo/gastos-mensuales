"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsPage } from "@/components/SettingsPage";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsRoute() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, isClient, router]);

  if (!isClient || loading || !user) {
    return null;
  }

  return <SettingsPage userId={user.id} />;
}
