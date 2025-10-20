export type SessionUser = {
  id: string;
  username: string;
  email: string;
  roleId: number;
  plan?: string | null;
};
