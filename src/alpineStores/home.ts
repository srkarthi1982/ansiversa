import Alpine from 'alpinejs';

class Home {
  isLoading = false;

  onInit(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 2000);
  }
}

export type HomeStore = Home;

Alpine.store('home', new Home());
