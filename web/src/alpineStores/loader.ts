import Alpine from 'alpinejs';

class Loader {
  private count = 0;

  show(): void {
    this.count += 1;
  }

  hide(): void {
    if (this.count > 0) {
      this.count -= 1;
    }
  }

  get visible(): boolean {
    return this.count > 0;
  }
}

export type LoaderStore = Loader;

Alpine.store('loader', new Loader());
