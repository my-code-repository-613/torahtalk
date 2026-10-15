import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ALL_SEFER_SLUGS, ALL_PARSHA_SLUGS } from './lib/torah';

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    sefer: z.enum(ALL_SEFER_SLUGS as [string, ...string[]]),
    parsha: z.enum(ALL_PARSHA_SLUGS as [string, ...string[]]),
    year: z.number().int().min(1990).max(2100),
    date: z.coerce.date(),
    verses: z.string().optional(),
    summary: z.string().optional(),
    originalUrl: z.string().url().optional(),
    wpId: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { essays };
