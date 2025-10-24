import Alpine from 'alpinejs';
import { flashLoader } from '../base';

export type VerifyEmailStatus = 'missing' | 'invalid' | 'expired' | 'used' | 'user_missing' | 'success';

class VerifyEmail {
  status: VerifyEmailStatus = 'missing';
  isProcessing = false;

  onInit(): void {
    this.showLoaderBriefly();
  }

  setStatus(status: VerifyEmailStatus): void {
    this.status = status;
  }

  startProcessing(): void {
    this.isProcessing = true;
  }

  stopProcessing(): void {
    this.isProcessing = false;
  }

  private showLoaderBriefly(): void {
    flashLoader(400);
  }
}

export type VerifyEmailStore = VerifyEmail;

Alpine.store('verifyEmail', new VerifyEmail());
