import { register } from './register';
import { login } from './login';
import { forgotPassword } from './forgot-password';
import { resetPassword } from './reset-password';
import { changePassword } from './change-password';
import { logout } from './logout';

export const auth = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};

export { register, login, forgotPassword, resetPassword, changePassword, logout };
