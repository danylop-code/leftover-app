import { z } from 'zod';

/** Error envelope returned by every non-2xx API response. */
export const ApiError = z.object({
  error: z.object({
    /** Stable machine code: `validation`, `not_found`, `internal`, or a domain code like `sold_out`. */
    code: z.string().min(1),
    message: z.string(),
    /** Per-field messages for `validation`, keyed by dotted path. */
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;

export const Health = z.object({ ok: z.literal(true) });
export type Health = z.infer<typeof Health>;
