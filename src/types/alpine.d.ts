import type { LoaderStore } from '../alpineStores/loader';
import type { HomeStore } from '../alpineStores/home';
import type { LoginStore } from '../alpineStores/auth/login';
import type { SignupStore } from '../alpineStores/auth/signup';
import type { ForgotPasswordStore } from '../alpineStores/auth/forgotPassword';
import type { ChangePasswordStore } from '../alpineStores/auth/changePassword';
import type { VerifyEmailStore } from '../alpineStores/auth/verifyEmail';
import type { DocumentationStore } from '../alpineStores/documentation';
import type { PricingStore } from '../alpineStores/pricing';
import type { FeaturesStore } from '../alpineStores/features';
import type { FaqStore } from '../alpineStores/faq';
import type { ContactStore } from '../alpineStores/contact';
import type { ResumeStore } from '../alpineStores/resume/index';
import type { QuizStore } from '../alpineStores/quiz/quiz';
import type { SubjectsStore } from '../alpineStores/quiz/subjects';

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
      resume: ResumeStore;
      quiz: QuizStore;
      subjects: SubjectsStore;
    }
  }
}
