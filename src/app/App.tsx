import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { AccountsPage } from "../pages/AccountsPage";
import { TransactionsPage } from "../pages/TransactionsPage";
import { BudgetPage } from "../pages/BudgetPage";
import { BillsPage } from "../pages/BillsPage";
import { GoalsPage } from "../pages/GoalsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route
            path="/reports"
            element={
              <PlaceholderPage
                title="Reports"
                description="See spending trends, income versus expenses, and category breakdowns."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Manage profile, currency, theme, and app preferences."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}