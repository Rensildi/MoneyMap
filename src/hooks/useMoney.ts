import { useCallback } from "react";
import { formatMoney } from "../lib/formatMoney";
import { useProfile } from "./useProfile";

export function useMoney() {
  const { settings } = useProfile();

  const money = useCallback(
    (cents: number) => {
      return formatMoney(cents, settings.currency);
    },
    [settings.currency],
  );

  return {
    money,
    currency: settings.currency,
  };
}