import { z } from 'zod';

export const configSchema = z.object({
  output: z.object({
    format: z.enum(['markdown', 'json']).default('markdown'),
    mode: z.enum(['both', 'copy', 'file']).default('both'),
  }),
  naming: z.object({
    pattern: z.string().default('.sumup_<timestamp>.md'),
  }),
  git: z.object({
    baseBranch: z.string().default('main'),
  }),
});

export type Config = z.infer<typeof configSchema>;

export const DEFAULTS = configSchema.parse({
  output: {},
  naming: {},
  git: {},
});
