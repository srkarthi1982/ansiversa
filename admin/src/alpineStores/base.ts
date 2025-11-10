import Alpine from 'alpinejs';
import type { LoaderStore } from './loader';
import { clone } from '../utils/clone';
export { clone } from '../utils/clone';

type LoaderMethods = Pick<LoaderStore, 'show' | 'hide'>;

type StoreRecord = Record<string, unknown>;

const hasLoaderMethods = (value: unknown): value is LoaderMethods =>
  Boolean(value) && typeof (value as LoaderMethods).show === 'function' && typeof (value as LoaderMethods).hide === 'function';

export abstract class BaseStore {
  protected readonly loader: LoaderMethods | null;

  protected constructor() {
    this.loader = BaseStore.resolveLoader();
  }

  protected static resolveLoader(): LoaderMethods | null {
    const loader = Alpine.store('loader') as LoaderStore | undefined;
    return hasLoaderMethods(loader) ? loader : null;
  }

  protected getStore<TStore extends StoreRecord = StoreRecord>(name: string): TStore | null {
    const store = Alpine.store(name) as TStore | undefined;
    return store ?? null;
  }

  protected clone<TValue>(value: TValue): TValue {
    return clone(value);
  }

  protected showLoaderBriefly(duration = 300): void {
    const loader = this.loader;
    if (!loader) return;
    loader.show();
    setTimeout(() => loader.hide(), duration);
  }

  protected setLoaderVisible(visible: boolean): void {
    const loader = this.loader;
    if (!loader) return;
    if (visible) {
      loader.show();
    } else {
      loader.hide();
    }
  }

  protected withLoader<T>(callback: () => T): T {
    const loader = this.loader;
    loader?.show();
    try {
      return callback();
    } finally {
      loader?.hide();
    }
  }

  protected async withLoaderAsync<T>(callback: () => Promise<T>): Promise<T> {
    const loader = this.loader;
    loader?.show();
    try {
      return await callback();
    } finally {
      loader?.hide();
    }
  }
}

export type LoaderControls = LoaderMethods;
