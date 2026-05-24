export default function App() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="text-sm font-medium text-blue-600">CashPilot</p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Your modern budget tracker is starting.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            We are building a clean finance dashboard with manual accounts,
            transactions, monthly budgets, and a free spending limit that turns
            red when you go over.
          </p>

          <button className="mt-8 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800">
            Start building
          </button>
        </div>
      </div>
    </main>
  );
}