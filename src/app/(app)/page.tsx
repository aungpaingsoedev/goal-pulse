import type { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Here's what's happening in football today.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
