"use client";

import { TokenManager } from "@/services/http";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = TokenManager.getAccess();

    if (!token) {
      router.replace("/signin");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // hoặc loading spinner
  }

  return <>{children}</>;
}
