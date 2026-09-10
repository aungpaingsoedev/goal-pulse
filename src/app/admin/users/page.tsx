"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/football/EmptyState";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Profile directory requires Supabase profiles table."
      />
      <EmptyState
        icon={Users}
        title="User admin coming online"
        description="When auth is configured, registered profiles appear here with roles."
      />
    </div>
  );
}
