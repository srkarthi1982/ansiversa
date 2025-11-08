import Alpine from 'alpinejs';
import { BaseStore } from '../base';

export type VerifyEmailStatus = 'missing' | 'invalid' | 'expired' | 'used' | 'user_missing' | 'success';

class VerifyEmail extends BaseStore {
  status: VerifyEmailStatus = 'missing';
  isProcessing = false;

  onInit(): void {
    this.showLoaderBriefly(400);
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

}

export type VerifyEmailStore = VerifyEmail;

Alpine.store('verifyEmail', new VerifyEmail());
