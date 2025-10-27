import { fetchUsers } from './users';
import { fetchRoles } from './roles';

export const app = {
  fetchUsers,
  fetchRoles,
};

export type AppActions = typeof app;

export { fetchUsers, fetchRoles };
