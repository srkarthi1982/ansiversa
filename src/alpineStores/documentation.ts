import Alpine from 'alpinejs';

type DocsSection = 'overview' | 'guides' | 'api' | 'deployment';

class Documentation {
  activeSection: DocsSection = 'overview';

  onInit(): void {
    this.showLoaderBriefly();
  }

  setSection(section: DocsSection): void {
    this.activeSection = section;
  }

  private showLoaderBriefly(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 300);
  }
}

export type DocumentationStore = Documentation;

Alpine.store('documentation', new Documentation());
