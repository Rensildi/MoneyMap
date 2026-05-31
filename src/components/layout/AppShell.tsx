import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { InstallPrompt } from "../pwa/InstallPrompt";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Accounts",
    path: "/accounts",
    icon: WalletCards,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: ReceiptText,
  },
  {
    label: "Budget",
    path: "/budget",
    icon: CreditCard,
  },
  {
    label: "Bills",
    path: "/bills",
    icon: CalendarDays,
  },
  {
    label: "Goals",
    path: "/goals",
    icon: Target,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export function AppShell() {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-transparent">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/70 bg-white/70 p-5 backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            CP
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              Money Map
            </p>
            <p className="text-xs font-medium text-slate-500">
              Budget with clarity
            </p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-300"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="pb-24 lg:ml-72 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/90 px-4 py-3 shadow-2xl shadow-slate-300/70 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition ${
                  isActive ? "text-slate-950" : "text-slate-400"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <InstallPrompt />
    </div>
  );
}