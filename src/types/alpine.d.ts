import type { LoaderStore } from '../alpineStores/loader';
import type { HomeStore } from '../alpineStores/home';
import type { LoginStore } from '../alpineStores/login';
import type { SignupStore } from '../alpineStores/signup';
import type { ForgotPasswordStore } from '../alpineStores/forgotPassword';
import type { ChangePasswordStore } from '../alpineStores/changePassword';
import type { VerifyEmailStore } from '../alpineStores/verifyEmail';
import type { DocumentationStore } from '../alpineStores/documentation';
import type { PricingStore } from '../alpineStores/pricing';
import type { FeaturesStore } from '../alpineStores/features';
import type { FaqStore } from '../alpineStores/faq';
import type { ContactStore } from '../alpineStores/contact';
import type { QuizStore } from '../alpineStores/quiz';
import type { SubjectsStore } from '../alpineStores/subjects';

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
      features: FeaturesStore;
      faq: FaqStore;
      contact: ContactStore;
      quiz: QuizStore;
      subjects: SubjectsStore;
    }
  }
}
