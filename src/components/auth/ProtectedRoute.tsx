import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="text-sm font-semibold text-blue-600">CashPilot</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Loading your app...
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Checking your session.
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}