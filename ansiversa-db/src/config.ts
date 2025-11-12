import { z } from "zod";

import type { AstroDbDriverOptions } from "./drivers/astrodb";

const AstroDbEnvSchema = z.object({
  ASTRO_DB_URL: z.string().url(),
  ASTRO_DB_AUTH_TOKEN: z.string().optional(),
});

export type AstroDbEnvConfig = z.infer<typeof AstroDbEnvSchema>;

export const loadAstroDbConfig = (
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): AstroDbDriverOptions => {
  const parsed = AstroDbEnvSchema.parse({
    ASTRO_DB_URL: env.ASTRO_DB_URL,
    ASTRO_DB_AUTH_TOKEN: env.ASTRO_DB_AUTH_TOKEN,
  });

  return {
    url: parsed.ASTRO_DB_URL,
    authToken: parsed.ASTRO_DB_AUTH_TOKEN,
  };
};
