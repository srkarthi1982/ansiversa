import Alpine from 'alpinejs';
import { flashLoader } from '../base';

class Login {
  isLoading = false;
  identifier = '';
  password = '';

  onInit(): void {
    flashLoader(2000);
  }

  async onSubmit(): Promise<void> {
    // Placeholder for login submission logic
  }
}

export type LoginStore = Login;

Alpine.store('login', new Login());
