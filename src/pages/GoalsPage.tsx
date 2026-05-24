import { useEffect, useMemo, useState } from "react";
import { Flag, PiggyBank, Target, Trophy } from "lucide-react";
import { GoalCard } from "../components/goals/GoalCard";
import { GoalForm } from "../components/goals/GoalForm";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { formatMoney } from "../lib/formatMoney";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoalProgress,
} from "../services/goalService";
import type { Goal } from "../types/goal";

export function GoalsPage() {
  const { user } = useAuth();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [savingMessage, setSavingMessage] = useState("");

  useEffect(() => {
    async function loadGoals() {
      if (!user) {
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const savedGoals = await fetchGoals(user.id);
        setGoals(savedGoals);
      } catch (error) {
        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError("Could not load goals.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, [user]);

  const totalTargetCents = useMemo(() => {
    return goals.reduce((total, goal) => total + goal.targetCents, 0);
  }, [goals]);

  const totalProgressCents = useMemo(() => {
    return goals.reduce((total, goal) => total + goal.currentCents, 0);
  }, [goals]);

  const completedGoalsCount = useMemo(() => {
    return goals.filter((goal) => goal.currentCents >= goal.targetCents).length;
  }, [goals]);

  const overallProgress =
    totalTargetCents > 0
      ? Math.round((totalProgressCents / totalTargetCents) * 100)
      : 0;

  function showSavedMessage(message: string) {
    setSavingMessage(message);

    window.setTimeout(() => {
      setSavingMessage("");
    }, 2200);
  }

  async function handleCreateGoal(goal: Goal) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      const savedGoal = await createGoal(user.id, {
        name: goal.name,
        type: goal.type,
        targetCents: goal.targetCents,
        currentCents: goal.currentCents,
        targetDate: goal.targetDate,
      });

      setGoals((currentGoals) => [savedGoal, ...currentGoals]);
      showSavedMessage("Goal saved.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not create goal.");
      }
    }
  }

  async function handleAddProgress(goalId: string, amountCents: number) {
    if (!user) {
      return;
    }

    const goal = goals.find((item) => item.id === goalId);

    if (!goal) {
      return;
    }

    const nextCurrentCents = Math.min(
      goal.currentCents + amountCents,
      goal.targetCents,
    );

    setPageError("");

    try {
      const updatedGoal = await updateGoalProgress(
        user.id,
        goalId,
        nextCurrentCents,
      );

      setGoals((currentGoals) =>
        currentGoals.map((item) => {
          if (item.id !== goalId) {
            return item;
          }

          return updatedGoal;
        }),
      );

      showSavedMessage("Goal progress updated.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not update goal progress.");
      }
    }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!user) {
      return;
    }

    setPageError("");

    try {
      await deleteGoal(user.id, goalId);

      setGoals((currentGoals) =>
        currentGoals.filter((goal) => goal.id !== goalId),
      );

      showSavedMessage("Goal deleted.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Could not delete goal.");
      }
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Goals</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Money goals
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track emergency funds, vacations, car savings, house savings, and
            debt payoff goals. These goals are now saved in Supabase.
          </p>
        </div>
      </div>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {pageError}
        </div>
      )}

      {savingMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savingMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="font-medium text-slate-600">Loading goals...</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Target
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {formatMoney(totalTargetCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Target size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Progress
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-emerald-600">
                    {formatMoney(totalProgressCents)}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <PiggyBank size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Overall Progress
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-amber-600">
                    {overallProgress}%
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Flag size={22} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Goals
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {completedGoalsCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                  <Trophy size={22} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
            <div>
              <Card className="mb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Goal Tracker
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Active goals
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add contributions or debt payments to update your progress.
                    Progress is saved in the goals table.
                  </p>
                </div>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onAddProgress={handleAddProgress}
                    onDeleteGoal={handleDeleteGoal}
                  />
                ))}
              </div>

              {goals.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Target size={24} />
                  </div>

                  <p className="mt-4 font-medium text-slate-600">
                    No goals yet.
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Add an emergency fund, vacation goal, car goal, or debt
                    payoff goal.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <GoalForm onCreateGoal={handleCreateGoal} />

              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Supabase status
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Goals are now saved in the goals table. When you add progress,
                  the current_cents value updates in Supabase.
                </p>
              </Card>

              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Good goals to start with
                </p>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Emergency fund — $1,000 first milestone
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    3–6 months of expenses
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Pay off credit card debt
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Vacation or travel fund
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    Car down payment
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    House down payment
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}