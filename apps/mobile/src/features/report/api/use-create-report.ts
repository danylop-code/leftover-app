import { type ReportBody, ReportCreated } from '@leftover/shared';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/client';

/** Sends a problem report; resolves to its `R-####` reference. */
export const useCreateReport = () =>
  useMutation({
    mutationFn: (body: ReportBody) =>
      apiRequest('/reports', { method: 'POST', body, schema: ReportCreated }),
  });
