import Alpine from 'alpinejs';

class ContactStoreImpl {
  onInit(): void {
    this.showLoaderBriefly();
  }

  private showLoaderBriefly(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 300);
  }
}

export type ContactStore = ContactStoreImpl;

Alpine.store('contact', new ContactStoreImpl());
