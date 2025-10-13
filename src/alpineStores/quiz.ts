import Alpine from 'alpinejs';

class QuizStoreImpl {
  onInit(): void {
    this.showLoaderBriefly();
  }

  private showLoaderBriefly(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 300);
  }
}

export type QuizStore = QuizStoreImpl;

Alpine.store('quiz', new QuizStoreImpl());
