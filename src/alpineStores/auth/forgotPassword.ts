import Alpine from 'alpinejs';
import { flashLoader } from '../base';

type ForgotPasswordForm = {
  email: string;
};

const DEFAULT_FORM: ForgotPasswordForm = {
  email: '',
};

class ForgotPassword {
  isSubmitting = false;
  form: ForgotPasswordForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly();
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

  private showLoaderBriefly(): void {
    flashLoader(400);
  }
}

export type ForgotPasswordStore = ForgotPassword;

Alpine.store('forgotPassword', new ForgotPassword());
