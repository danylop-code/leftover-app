import { z } from 'zod';
import { Id, IsoDateTime } from './common';

export const REVIEW_TEXT_MAX = 500;
export const RECENT_REVIEWS_LIMIT = 3;

const Stars = z.number().int().min(1).max(5);

/** The optional "Rate the details" aspects. */
export const REVIEW_ASPECTS = ['quality', 'variety', 'freshness', 'ease'] as const;
export type ReviewAspect = (typeof REVIEW_ASPECTS)[number];

/** `POST /orders/:id/review`. */
export const ReviewBody = z.object({
  overall: Stars,
  quality: Stars.optional(),
  variety: Stars.optional(),
  freshness: Stars.optional(),
  ease: Stars.optional(),
  text: z.string().trim().max(REVIEW_TEXT_MAX).default(''),
});
export type ReviewBody = z.input<typeof ReviewBody>;

/** A shop's recent review as other customers see it. */
export const ReviewSummary = z.object({
  id: Id,
  authorName: z.string().min(1),
  overall: Stars,
  text: z.string(),
  createdAt: IsoDateTime,
});
export type ReviewSummary = z.infer<typeof ReviewSummary>;

/** Per-aspect averages; null for an aspect nobody rated. */
export const AspectAverages = z.object({
  quality: z.number().nullable(),
  variety: z.number().nullable(),
  freshness: z.number().nullable(),
  ease: z.number().nullable(),
});
export type AspectAverages = z.infer<typeof AspectAverages>;

/** Average to one decimal (4.66 → 4.7). */
export const roundRating = (value: number) => Math.round(value * 10) / 10;
