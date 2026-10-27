import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Download, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useFinance } from "@/state/finance-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings · PocketPilot" },
      { name: "description", content: "Theme, data export, and reset options." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { expenses, incomes, recurring, budget, profile, updateProfile, userEmail } = useFinance();
  const [name, setName] = useState(profile.full_name ?? "");
  const [university, setUniversity] = useState(profile.university ?? "");
  const [userType, setUserType] = useState<typeof profile.user_type>(profile.user_type);

  useEffect(() => {
    setName(profile.full_name ?? "");
    setUniversity(profile.university ?? "");
    setUserType(profile.user_type);
  }, [profile.full_name, profile.university, profile.user_type]);

  const saveProfile = async () => {
    await updateProfile({
      full_name: name || null,
      university: university || null,
      user_type: userType,
    });
    toast.success("Profile updated");
  };
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pp.theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const d = stored ? stored === "dark" : prefersDark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pp.theme", next ? "dark" : "light");
  };

  const exportData = () => {
    const payload = { budget, expenses, incomes, recurring, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pocketpilot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported data");
  };

  const wipe = () => {
    if (!confirm("Erase all PocketPilot data on this device?")) return;
    ["pp.budget", "pp.expenses", "pp.incomes", "pp.recurring"].forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Personalize your PocketPilot experience and manage your data."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profile" description={`Signed in as ${userEmail ?? ""}`}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">University</label>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Your university"
                className="mt-1 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">I am a</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(["student", "job_holder", "both"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setUserType(v)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize transition ${
                      userType === v
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background/60 text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {v === "job_holder" ? "Job holder" : v}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveProfile}
              className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Save profile
            </button>
          </div>
        </Card>

        <Card title="Appearance" description="Switch between light and dark themes.">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 rounded-xl border border-input bg-background/60 px-4 py-3 text-sm font-medium transition hover:bg-accent"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {dark ? "Dark mode" : "Light mode"}
            <span className="ml-auto text-xs text-muted-foreground">Tap to switch</span>
          </button>
        </Card>

        <Card title="Export data" description="Download all your records as JSON.">
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Download className="h-4 w-4" /> Download JSON
          </button>
        </Card>

        <Card title="Danger zone" description="Reset all data on this device.">
          <button
            onClick={wipe}
            className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" /> Erase everything
          </button>
        </Card>

        <Card title="About PocketPilot" description="Built for students. Save smarter, live better.">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>{expenses.length} expenses · {incomes.length} income entries · {recurring.length} bills</div>
            <div>Currency: {budget.currency}</div>
            <div className="pt-2 text-xs">v1.0 · Data stored securely in your cloud account.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft">
      <div className="font-display text-lg font-semibold">{title}</div>
      <div className="mb-4 text-sm text-muted-foreground">{description}</div>
      {children}
    </div>
  );
}
