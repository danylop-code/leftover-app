import { ReportBody } from '@leftover/shared';
import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import type { AppEnv } from '../lib/env';
import { validate } from '../lib/validate';
import { createReport } from '../services/reports';

// Customers and shops alike can report a problem.
export const reportsRoute = new Hono<AppEnv>()
  .use(requireAuth)
  .post('/', validate('json', ReportBody), async (c) =>
    c.json(await createReport(c.var.db, c.var.user.id, c.req.valid('json')), 201),
  );
