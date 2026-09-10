import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(64, "Display name must be at most 64 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const favoriteTypeSchema = z.enum([
  "team",
  "league",
  "fixture",
  "player",
]);

export const favoriteSchema = z.object({
  type: favoriteTypeSchema,
  entityId: z.number().int().positive(),
});

export const removeFavoriteSchema = z.object({
  id: z.string().uuid().optional(),
  type: favoriteTypeSchema.optional(),
  entityId: z.number().int().positive().optional(),
}).refine(
  (data) => Boolean(data.id) || (Boolean(data.type) && Boolean(data.entityId)),
  { message: "Provide either id or type + entityId" },
);

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
  type: z.enum(["all", "team", "league", "player", "fixture"]).default("all"),
  limit: z.number().int().min(1).max(50).default(20),
});

const dateYmd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const fixturesQuerySchema = z.object({
  date: dateYmd,
  league: z.coerce.number().int().positive().optional(),
  status: z.string().trim().min(1).max(16).optional(),
});

export const leaguesQuerySchema = z.object({
  country: z.string().trim().min(1).max(64).optional(),
  season: z.coerce.number().int().min(2000).max(2100).optional(),
  current: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const teamsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  league: z.coerce.number().int().positive().optional(),
  season: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const playersQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  team: z.coerce.number().int().positive().optional(),
  season: z.coerce.number().int().min(2000).max(2100).optional(),
  page: z.coerce.number().int().min(1).max(100).optional(),
});

export const standingsQuerySchema = z.object({
  season: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const idParamSchema = z.coerce.number().int().positive();

export const markNotificationsSchema = z
  .object({
    id: z.string().uuid().optional(),
    ids: z.array(z.string().uuid()).min(1).max(100).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.id) || Boolean(data.ids?.length) || data.all, {
    message: "Provide id, ids, or all: true",
  });

export const syncActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("sync_live"),
  }),
  z.object({
    action: z.literal("live"),
  }),
  z.object({
    action: z.literal("sync_fixtures"),
    date: dateYmd.optional(),
  }),
  z.object({
    action: z.literal("fixtures"),
    date: dateYmd.optional(),
  }),
  z.object({
    action: z.literal("sync_fixture"),
    fixtureId: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("sync_leagues"),
    country: z.string().trim().min(1).max(64).optional(),
    season: z.number().int().min(2000).max(2100).optional(),
  }),
  z.object({
    action: z.literal("leagues"),
    country: z.string().trim().min(1).max(64).optional(),
    season: z.number().int().min(2000).max(2100).optional(),
  }),
  z.object({
    action: z.literal("sync_teams"),
    leagueId: z.number().int().positive().optional(),
    season: z.number().int().min(2000).max(2100).optional(),
  }),
  z.object({
    action: z.literal("teams"),
    leagueId: z.number().int().positive().optional(),
    season: z.number().int().min(2000).max(2100).optional(),
  }),
  z.object({
    action: z.literal("sync_standings"),
    leagueId: z.number().int().positive(),
    season: z.number().int().min(2000).max(2100),
  }),
  z.object({
    action: z.literal("standings"),
    leagueId: z.number().int().positive(),
    season: z.number().int().min(2000).max(2100),
  }),
  z.object({
    action: z.literal("invalidate_cache"),
    key: z.string().min(1).optional(),
  }),
]);

export type FixturesQueryInput = z.infer<typeof fixturesQuerySchema>;
export type MarkNotificationsInput = z.infer<typeof markNotificationsSchema>;

export const notificationPrefsSchema = z.object({
  goals: z.boolean(),
  cards: z.boolean(),
  kickoff: z.boolean(),
  finalWhistle: z.boolean(),
  lineups: z.boolean(),
  substitutions: z.boolean(),
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .nullable()
    .optional(),
  avatarUrl: z.string().url().nullable().optional(),
  notificationPrefs: notificationPrefsSchema.partial().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type RemoveFavoriteInput = z.infer<typeof removeFavoriteSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SyncActionInput = z.infer<typeof syncActionSchema>;
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
