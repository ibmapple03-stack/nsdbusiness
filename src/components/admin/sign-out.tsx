"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-[var(--radius-sm)] px-2 py-1 text-sm font-medium text-navy-200 underline-offset-4 hover:text-white hover:underline"
    >
      Sign out
    </button>
  );
}
