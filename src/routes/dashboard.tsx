import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CreditCard, LayoutDashboard, Languages, LifeBuoy, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout;
});

function DashboardLayout() {
  return <Outlet />;
}
