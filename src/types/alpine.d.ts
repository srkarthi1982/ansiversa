import type { LoaderStore } from '../alpineStores/loader';
import type { HomeStore } from '../alpineStores/home';
import type { LoginStore } from '../alpineStores/login';
import type { SignupStore } from '../alpineStores/signup';
import type { ForgotPasswordStore } from '../alpineStores/forgotPassword';
import type { ChangePasswordStore } from '../alpineStores/changePassword';
import type { VerifyEmailStore } from '../alpineStores/verifyEmail';
import type { DocumentationStore } from '../alpineStores/documentation';
import type { PricingStore } from '../alpineStores/pricing';
import type { FaqsStore } from '../alpineStores/faqs';

declare module 'alpinejs' {
  namespace Alpine {
    interface Stores {
      loader: LoaderStore;
      home: HomeStore;
      login: LoginStore;
      signup: SignupStore;
      forgotPassword: ForgotPasswordStore;
      changePassword: ChangePasswordStore;
      verifyEmail: VerifyEmailStore;
      documentation: DocumentationStore;
      pricing: PricingStore;
      faqs: FaqsStore;
    }
  }
}
