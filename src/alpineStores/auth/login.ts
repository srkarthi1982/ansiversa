import Alpine from 'alpinejs';
import { BaseStore } from '../base';

class Login extends BaseStore {
  isLoading = false;
  identifier = '';
  password = '';

  onInit(): void {
    this.showLoaderBriefly(2000);
  }

  async onSubmit(): Promise<void> {
    // Placeholder for login submission logic
  }
}

export type LoginStore = Login;

Alpine.store('login', new Login());
