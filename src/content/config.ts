import { defineCollection, z } from 'astro:content';

const wissen = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    category: z.enum(['treatment', 'country', 'guide', 'faq']),
    relatedTreatments: z
      .array(z.enum(['ivf', 'icsi', 'egg-donation', 'sperm-donation', 'pgd']))
      .default([]),
    relatedCountries: z.array(z.string()).default([]),
    updatedAt: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { wissen };
