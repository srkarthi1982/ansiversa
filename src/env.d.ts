/// <reference types="astro/client" />

import type { Session } from 'astro:db';
import type { SessionUser } from './types/session-user';

declare global {
  namespace App {
    interface Locals {
      session?: typeof Session.$inferSelect | null;
      user?: SessionUser | null;
    }
  }
}

export {};
