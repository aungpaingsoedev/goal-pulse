"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset email is not configured for the local Prisma/SQLite
          setup yet. Sign in again or create a new account if needed.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
