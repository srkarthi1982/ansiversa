import Alpine from 'alpinejs';
import { BaseStore } from '../base';

type SignupForm = {
  username: string;
  email: string;
  password: string;
  confirm: string;
  remember: boolean;
  terms: boolean;
};

const DEFAULT_FORM: SignupForm = {
  username: '',
  email: '',
  password: '',
  confirm: '',
  remember: false,
  terms: false,
};

class Signup extends BaseStore {
  isSubmitting = false;
  form: SignupForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly(400);
  }

  updateField<K extends keyof SignupForm>(field: K, value: SignupForm[K]): void {
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

export type SignupStore = Signup;

Alpine.store('signup', new Signup());
