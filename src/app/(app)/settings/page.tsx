"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from "@/types/football";

const PREF_STORAGE_KEY = "gp_notification_prefs";

function readStoredPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(PREF_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

const PREF_LABELS: Array<{
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}> = [
  {
    key: "goals",
    label: "Goals",
    description: "Notify when your teams score.",
  },
  {
    key: "cards",
    label: "Cards",
    description: "Yellow and red card alerts.",
  },
  {
    key: "kickoff",
    label: "Kickoff",
    description: "Reminder when a match starts.",
  },
  {
    key: "finalWhistle",
    label: "Final whistle",
    description: "Full-time results for followed matches.",
  },
  {
    key: "lineups",
    label: "Lineups",
    description: "Starting XI announcements.",
  },
  {
    key: "substitutions",
    label: "Substitutions",
    description: "In-game substitution updates.",
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(readStoredPrefs);

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      toast.success("Preferences saved");
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Theme and notification preferences."
      />

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Switch between dark and light.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">
            Stored locally until account sync is configured.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          {PREF_LABELS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <Label htmlFor={item.key} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                id={item.key}
                checked={prefs[item.key]}
                onCheckedChange={(checked) => updatePref(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
