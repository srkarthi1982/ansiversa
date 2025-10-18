/// <reference types="astro/client" />

import type { Session, User } from 'astro:db';

declare namespace App {
  interface Locals {
    session?: typeof Session.$inferSelect | null;
    user?: typeof User.$inferSelect | null;
  }
}
