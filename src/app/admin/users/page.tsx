import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/football/EmptyState";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
  }> = [];

  try {
    users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    users = [];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Accounts stored in Prisma / SQLite."
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Register an account to see it listed here."
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.name || user.email.split("@")[0]}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Badge variant={user.role === "admin" ? "live" : "outline"}>
                {user.role}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
