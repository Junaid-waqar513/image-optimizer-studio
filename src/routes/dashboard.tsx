import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CreditCard, FolderOpen, Languages, LayoutDashboard, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/saved", label: "Saved Scans", icon: FolderOpen, exact: false },
  { to: "/dashboard/plan", label: "My Plan", icon: CreditCard, exact: false },
  { to: "/dashboard/support", label: "Support", icon: LifeBuoy, exact: false },
] as const;

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b border-border bg-card md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="size-4" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">ExpatMail AI</span>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-muted hover:text-foreground" }}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden px-5 py-6 md:block">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium text-foreground">Free plan</p>
            <p className="mt-1 text-xs text-muted-foreground">2 of 3 scans used this month</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <Link
              to="/dashboard/plan"
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              Upgrade to Premium →
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
