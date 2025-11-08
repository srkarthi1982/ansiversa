import Alpine from 'alpinejs';
import { BaseStore } from '../base';

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

class ChangePassword extends BaseStore {
  isSubmitting = false;
  form: ChangePasswordForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly(400);
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

}

export type ChangePasswordStore = ChangePassword;

Alpine.store('changePassword', new ChangePassword());
