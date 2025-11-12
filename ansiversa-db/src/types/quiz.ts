import { z } from "zod";

const isoDateTime = z
  .string()
  .refine((value) => {
    if (!value) return false;
    return !Number.isNaN(Date.parse(value));
  }, "Invalid ISO date time string");

export const PlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const NewPlatformSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  platformId: z.string(),
  prompt: z.string(),
  answer: z.string(),
  explanation: z.string().nullable().optional(),
  choices: z.array(z.string()).default([]),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const QuestionRowSchema = QuestionSchema.extend({
  choices: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
});

export type Platform = z.infer<typeof PlatformSchema>;
export type NewPlatform = z.infer<typeof NewPlatformSchema>;
export type Question = z.infer<typeof QuestionSchema>;

export const parsePlatform = (row: unknown): Platform => PlatformSchema.parse(row);

export const normalizeQuestion = (row: unknown): Question => {
  const parsed = QuestionRowSchema.parse(row);
  const choicesRaw = parsed.choices;

  let choices: string[] = [];
  if (Array.isArray(choicesRaw)) {
    choices = choicesRaw;
  } else if (typeof choicesRaw === "string" && choicesRaw.trim().length > 0) {
    try {
      const candidate = JSON.parse(choicesRaw);
      if (Array.isArray(candidate)) {
        choices = candidate.filter((item): item is string => typeof item === "string");
      }
    } catch (error) {
      throw new Error(`Failed to parse question choices JSON: ${error}`);
    }
  }

  return {
    id: parsed.id,
    platformId: parsed.platformId,
    prompt: parsed.prompt,
    answer: parsed.answer,
    explanation: parsed.explanation ?? undefined,
    choices,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
  };
};
