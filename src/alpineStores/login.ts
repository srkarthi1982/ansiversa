import Alpine from 'alpinejs';

class Login {
  isLoading = false;
  identifier = '';
  password = '';

  onInit(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 2000);
  }

  async onSubmit(): Promise<void> {
    // Placeholder for login submission logic
  }
}

export type LoginStore = Login;

Alpine.store('login', new Login());
