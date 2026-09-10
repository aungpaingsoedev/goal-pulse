"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }
      toast.success("Welcome back");
      router.replace(next);
      router.refresh();
    } catch {
      toast.error("Unable to sign in");
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    await signIn("google", { callbackUrl: next });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access favorites and live alerts.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {googleEnabled ? (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void signInWithGoogle()}
          >
            Continue with Google
          </Button>
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
