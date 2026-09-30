import { QueryClient } from '@tanstack/react-query';
import { MAX_QUERY_RETRIES } from '../constants/api';
import { ApiError, ParseError } from './client';

/** 4xx and schema mismatches are final; network and 5xx failures get a few retries. */
export const shouldRetry = (failureCount: number, error: unknown) => {
  if (error instanceof ParseError) return false;
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < MAX_QUERY_RETRIES;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: false },
    },
  });
