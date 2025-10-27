import { fetchUsers } from './users';

export const app = {
  fetchUsers,
};

export type AppActions = typeof app;

export { fetchUsers };
