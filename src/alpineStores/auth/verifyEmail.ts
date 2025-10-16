import Alpine from 'alpinejs';

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
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 400);
  }
}

export type VerifyEmailStore = VerifyEmail;

Alpine.store('verifyEmail', new VerifyEmail());
