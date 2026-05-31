import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Mail, User, WalletCards } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, fullName);

        setMessage(
          "Account created. If email confirmation is enabled, check your inbox before signing in.",
        );
        setMode("signin");
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
            CP
          </div>

          <div>
            <p className="text-xl font-semibold tracking-tight">Money Map</p>
            <p className="text-sm text-slate-400">Budget with clarity</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-300">
            Modern manual budgeting
          </p>

          <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight">
            Know what you can safely spend before money gets messy.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Track manual accounts, transactions, free spending limits, bills,
            goals, and reports without connecting your bank.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <p className="text-sm font-semibold">Manual accounts</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              No bank linking required.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <p className="text-sm font-semibold">Free spending</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Red/yellow/green limit logic.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <p className="text-sm font-semibold">Private data</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              User-specific Supabase rows.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              CP
            </div>

            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-950">
                Money Map
              </p>
              <p className="text-sm text-slate-500">Budget with clarity</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-8">
            <div className="mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <WalletCards size={24} />
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "signin"
                  ? "Sign in to manage your saved budget data."
                  : "Start tracking your money with a private Money Map account."}
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            {formError && (
              <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full name
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-950">
                    <User size={18} className="text-slate-400" />

                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-950">
                  <Mail size={18} className="text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-950">
                  <Lock size={18} className="text-slate-400" />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode((currentMode) =>
                  currentMode === "signin" ? "signup" : "signin",
                );
                setFormError("");
                setMessage("");
              }}
              className="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}