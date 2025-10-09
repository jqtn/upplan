"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import type { SessionSettings } from "@/types/session-settings";
import { useTheme } from "next-themes";
import { getSettings } from "@/app/actions/setting";

const SessionSettingsContext = createContext<{
  sessionSettings: SessionSettings | null;
  setSessionSettings: (sessionSettings: SessionSettings) => void;
}>({
  sessionSettings: {} as SessionSettings,
  setSessionSettings: () => {},
});

export const SessionSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionSettings, setSessionSettingsState] =
    useState<SessionSettings | null>(null);
  const [needsFetch, setNeedsFetch] = useState<boolean>(false);
  const { setTheme } = useTheme();

  const addDefaultCategory = (categories: string[]) => {
    return categories.length > 0 ? ["未分類", ...categories] : categories;
  };

  useEffect(() => {
    if (sessionStorage.getItem("version") !== null) {
      const settings = {
        categories: addDefaultCategory(
          JSON.parse(sessionStorage.getItem("categories") ?? "[]")
        ),
        stepProgressType: Number(
          sessionStorage.getItem("step_progress_type") ?? "0"
        ),
        activitySummaryDays: Number(
          sessionStorage.getItem("activity_summary_days") ?? "7"
        ),
        theme: sessionStorage.getItem("theme") ?? "system",
      };

      setSessionSettingsState(settings);
    } else {
      setNeedsFetch(true);
    }
  }, []);

  const setSessionSettings = useCallback(
    (newSettings: SessionSettings) => {
      setSessionSettingsState({
        categories: addDefaultCategory(newSettings.categories),
        stepProgressType: newSettings.stepProgressType,
        activitySummaryDays: newSettings.activitySummaryDays,
        theme: newSettings.theme,
      });
      sessionStorage.setItem("version", "1.0");
      sessionStorage.setItem(
        "categories",
        JSON.stringify(newSettings.categories)
      );
      sessionStorage.setItem(
        "step_progress_type",
        JSON.stringify(newSettings.stepProgressType)
      );
      sessionStorage.setItem(
        "activity_summary_days",
        JSON.stringify(newSettings.activitySummaryDays)
      );
      sessionStorage.setItem("theme", JSON.stringify(newSettings.theme));
      setTheme(newSettings.theme);
    },
    [setTheme]
  );

  useEffect(() => {
    if (needsFetch) {
      getSettings().then((result) => {
        if (result.data) {
          setSessionSettings(result.data);
        }
      });
    }
  }, [needsFetch, setSessionSettings]);

  return (
    <SessionSettingsContext.Provider
      value={{ sessionSettings, setSessionSettings }}
    >
      {children}
    </SessionSettingsContext.Provider>
  );
};

export const useSessionSettings = () => useContext(SessionSettingsContext);
