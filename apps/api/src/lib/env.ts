import type { Me } from '@leftover/shared';
import type { Db } from '../db/client';

export type AppEnv = {
  Bindings: Env;
  Variables: {
    /** Set by `withDb` on every request. */
    db: Db;
    /** Set by `requireAuth`. */
    user: Me;
    /** Hash of the current bearer token, for logout. Set by `requireAuth`. */
    tokenHash: string;
  };
};
