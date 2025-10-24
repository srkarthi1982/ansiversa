import Alpine from 'alpinejs';
import { flashLoader } from '../base';

type ChangePasswordForm = {
  identifier: string;
  oldPassword: string;
  newPassword: string;
  confirm: string;
};

const DEFAULT_FORM: ChangePasswordForm = {
  identifier: '',
  oldPassword: '',
  newPassword: '',
  confirm: '',
};

class ChangePassword {
  isSubmitting = false;
  form: ChangePasswordForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly();
  }

  updateField<K extends keyof ChangePasswordForm>(field: K, value: ChangePasswordForm[K]): void {
    this.form[field] = value;
  }

  resetForm(): void {
    this.form = { ...DEFAULT_FORM };
  }

  startSubmitting(): void {
    this.isSubmitting = true;
  }

  stopSubmitting(): void {
    this.isSubmitting = false;
  }

  private showLoaderBriefly(): void {
    flashLoader(400);
  }
}

export type ChangePasswordStore = ChangePassword;

Alpine.store('changePassword', new ChangePassword());
