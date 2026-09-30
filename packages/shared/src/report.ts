import { z } from 'zod';
import { Id } from './common';

export const REPORT_MESSAGE_MIN = 10;
export const REPORT_MESSAGE_MAX = 500;
/** Orders offered in "Which order?" go back this many days. */
export const REPORT_ORDER_DAYS = 7;

export const ReportSubject = z.enum(['order', 'closed', 'app', 'payment', 'other']);
export type ReportSubject = z.infer<typeof ReportSubject>;

/** `POST /reports`. */
export const ReportBody = z.object({
  subject: ReportSubject,
  /** Must be one of the reporter's own orders. */
  orderId: Id.optional(),
  message: z.string().trim().min(REPORT_MESSAGE_MIN).max(REPORT_MESSAGE_MAX),
});
export type ReportBody = z.infer<typeof ReportBody>;

export const ReportReference = z.string().regex(/^R-\d{4}$/);

export const ReportCreated = z.object({ reference: ReportReference });
export type ReportCreated = z.infer<typeof ReportCreated>;
