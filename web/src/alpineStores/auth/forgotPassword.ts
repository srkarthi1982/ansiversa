import Alpine from 'alpinejs';
import { BaseStore } from '../base';

type ForgotPasswordForm = {
  email: string;
};

const DEFAULT_FORM: ForgotPasswordForm = {
  email: '',
};

class ForgotPassword extends BaseStore {
  isSubmitting = false;
  form: ForgotPasswordForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly(400);
  }

  updateEmail(value: string): void {
    this.form.email = value;
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

export type ForgotPasswordStore = ForgotPassword;

Alpine.store('forgotPassword', new ForgotPassword());
