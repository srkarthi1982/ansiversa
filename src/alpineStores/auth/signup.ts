import Alpine from 'alpinejs';

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

class Signup {
  isSubmitting = false;
  form: SignupForm = { ...DEFAULT_FORM };

  onInit(): void {
    this.showLoaderBriefly();
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

  private showLoaderBriefly(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 400);
  }
}

export type SignupStore = Signup;

Alpine.store('signup', new Signup());
