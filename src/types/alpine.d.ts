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
import type { ResumeStore } from '../pages/resume-builder/stores';
import type { PlatformStore } from '../pages/quiz/stores/platform';
import type { SubjectsStore } from '../pages/quiz/stores/subjects';
import type { TopicsStore } from '../pages/quiz/stores/topics';
import type { RoadmapsStore } from '../pages/quiz/stores/roadmaps';
import type { QuestionsStore } from '../pages/quiz/stores/questions';

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
      platform: PlatformStore;
      subjects: SubjectsStore;
      topics: TopicsStore;
      roadmaps: RoadmapsStore;
      questions: QuestionsStore;
    }
  }
}
