"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  ShoppingBag,
  Truck,
  RotateCcw,
  Award,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import {
  authenticateWithEmailAction,
  signOutAction,
  switchDemoPersonaAction,
} from "@/actions/auth-actions";
import { useToast } from "@/components/ui/toast-provider";
import type { AppUser } from "@/types";

interface LoginViewProps {
  currentUser: AppUser | null;
  googleConfigured: boolean;
  githubConfigured: boolean;
  enableDevSwitcher: boolean;
  callbackUrl: string;
}

export function LoginView({
  currentUser,
  googleConfigured,
  githubConfigured,
  enableDevSwitcher,
  callbackUrl,
}: LoginViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("priya.nair@shopsphere.in");
  const [password, setPassword] = useState("shopsphere123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setErrorMessage(null);
    const isConfigured =
      provider === "google" ? googleConfigured : githubConfigured;

    if (!isConfigured) {
      setErrorMessage(
        `${
          provider === "google" ? "Google" : "GitHub"
        } social login is not configured in this environment. Please sign in with Email & Password or select a Quick Demo Login chip below.`
      );
      showToast(
        `Use Email sign-in or Quick Demo Login below`,
        "info"
      );
      return;
    }

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl || "/",
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `Could not connect to ${provider} login. Please use email sign-in instead.`
      );
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await authenticateWithEmailAction({
        email,
        password,
        name: mode === "signup" ? name : undefined,
        mode,
      });

      if (!res.ok || !res.user) {
        setErrorMessage(res.error || "Authentication failed.");
        showToast(res.error || "Authentication failed", "error");
        return;
      }

      showToast(`Welcome back, ${res.user.name}!`, "success");
      router.push(
        res.user.role === "ADMIN" && callbackUrl === "/"
          ? "/dashboard"
          : callbackUrl || "/"
      );
      router.refresh();
    });
  };

  const handleQuickPersona = (
    personaEmail:
      | "admin@shopsphere.in"
      | "priya.nair@shopsphere.in"
      | "rohan.deshmukh@shopsphere.in",
    label: string,
    targetRedirect: string
  ) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await switchDemoPersonaAction(personaEmail);
      if (res.ok) {
        showToast(`Signed in as ${label}`, "success");
        router.push(targetRedirect);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Could not switch account.");
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      showToast("Signed out of your account.", "info");
      router.refresh();
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card-hover grid grid-cols-1 lg:grid-cols-12">
      {/* Left Column: Brand & Member Benefits Panel */}
      <div className="lg:col-span-5 bg-gradient-to-br from-ink-950 via-ink-900 to-primary-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Shop<span className="text-accent-400">Sphere</span>
              <span className="text-xs font-bold text-primary-300">.in</span>
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
              Everything you love about tech shopping, in one place.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sign in to unlock member-only pricing, track your deliveries in
              real time, and download official GST invoices.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-400">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Free Express Delivery
                </p>
                <p className="text-[11px] text-slate-300">
                  Fast doorstep delivery across India on orders over ₹2,000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  100% Genuine Brand Warranty
                </p>
                <p className="text-[11px] text-slate-300">
                  Authorized dealer for every brand in our catalog
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-300">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Easy 7-Day Replacements
                </p>
                <p className="text-[11px] text-slate-300">
                  Hassle-free returns and instant refunds
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative pt-8 border-t border-white/10 mt-8 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Protected by 256-bit SSL &amp; encrypted HTTP-only sessions</span>
        </div>
      </div>

      {/* Right Column: Clean Form Card */}
      <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-ink-900">
            {mode === "signin" ? "Sign In to Your Account" : "Create Account"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {mode === "signin"
              ? "Welcome back! Enter your email or continue with social sign-in."
              : "Join ShopSphere for faster checkout and exclusive member deals."}
          </p>
        </div>

        {/* Active Session Banner if already logged in */}
        {currentUser && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-success-800">
                  Signed in as {currentUser.name} ({currentUser.role})
                </p>
                <p className="text-success-700">{currentUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-success-200 px-3 py-1.5 text-xs font-bold text-danger-600 hover:bg-danger-50 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-xs sm:text-sm text-danger-800">
            <AlertCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Social Sign-In Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-800 shadow-xs hover:bg-slate-50 transition"
          >
            <span className="font-extrabold text-sm text-primary-600">G</span>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-ink-900 bg-ink-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ink-800 transition"
          >
            <span className="font-mono font-bold text-xs">GH</span>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1.5">
                Full Name <span className="text-danger-600">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1.5">
              Email Address <span className="text-danger-600">*</span>
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1.5">
              Password <span className="text-danger-600">*</span>
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-primary-700 active:scale-[0.99] disabled:opacity-60 transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          {mode === "signin" ? (
            <p>
              New to ShopSphere?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-bold text-primary-600 hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-bold text-primary-600 hover:underline"
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>

        {/* Compact Quick Demo Login Chips Below the Form */}
        {enableDevSwitcher && (
          <div className="border-t border-slate-100 pt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                Quick Demo Login
              </span>
              <span className="text-[11px] text-slate-400">
                1-click instant sign-in
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "priya.nair@shopsphere.in",
                    "Priya Nair",
                    callbackUrl || "/products"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-800 hover:border-primary-300 hover:bg-primary-50/50 transition"
              >
                <span>Priya Nair</span>
                <span className="rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-bold text-success-800">
                  Customer
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "rohan.deshmukh@shopsphere.in",
                    "Rohan Deshmukh",
                    callbackUrl || "/orders"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-800 hover:border-primary-300 hover:bg-primary-50/50 transition"
              >
                <span>Rohan Deshmukh</span>
                <span className="rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-bold text-success-800">
                  Customer
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "admin@shopsphere.in",
                    "Aarav Mehta (Admin)",
                    "/dashboard"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50/60 px-3 py-2 text-xs font-bold text-primary-800 hover:bg-primary-100/70 transition"
              >
                <span>Aarav Mehta</span>
                <span className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Store Admin
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
