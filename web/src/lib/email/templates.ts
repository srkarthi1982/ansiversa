import { createTemplate, type EmailTemplate, type EmailTemplateCategory } from './schema';

type TemplateSeed = {
  name: string;
  category: EmailTemplateCategory;
  subject?: string | null;
  body: string;
};

const templates: TemplateSeed[] = [
  {
    name: 'Warm outreach introduction',
    category: 'Outreach',
    subject: 'Quick introduction from {MyName}',
    body: `Hi {FirstName},

I hope your week is going well. I'm {MyName}, {MyTitle} at Ansiversa. We help teams like {Company} streamline
content workflows with an AI-powered studio that still feels handcrafted.

Would you be open to a 20-minute call next week to explore if this could support your goals as {Role}? Happy to
work around your schedule.

Thanks,
{MyName}`,
  },
  {
    name: 'Follow-up after demo',
    category: 'Follow-up',
    subject: 'Checking in after our conversation',
    body: `Hi {FirstName},

Thanks again for taking the time to walk me through {Company}'s roadmap. I enjoyed learning more about your
priorities around collaboration and quality.

If the recap deck or sandbox access would be helpful, just let me know. Otherwise, I'm happy to sync later this
week to discuss next steps.

Best,
{MyName}`,
  },
  {
    name: 'Status update with action items',
    category: 'Status Update',
    subject: 'Weekly update — {Company} x Ansiversa',
    body: `Hi {FirstName},

Here is the quick snapshot for this week:
• Completed: onboarding flow copy refresh and QA.
• In progress: localized templates for MENA launch.
• Next up: finalize approvals for the product tour script.

Please let me know if there is anything you'd like us to prioritize differently.

Regards,
{MyName}`,
  },
  {
    name: 'Thoughtful apology',
    category: 'Apology',
    subject: 'Apology for the delay',
    body: `Hi {FirstName},

I wanted to apologize for the delay in sending across the updated proposal. We missed the handoff on our side and
that is on me.

I've attached the revised version and added two additional options you requested. Please know that we've adjusted
our process to prevent this from happening again.

Appreciate your patience,
{MyName}`,
  },
  {
    name: 'Customer success check-in',
    category: 'Customer Success',
    subject: 'Quick success check-in',
    body: `Hi {FirstName},

How are things going with the latest Ansiversa release? I saw that your team activated the meeting summary workspace
and wanted to make sure the rollout felt smooth.

If you'd like, I'm happy to host a short refresher session for your broader team or share a template pack tailored
to {Company}.

Speak soon,
{MyName}`,
  },
  {
    name: 'Networking introduction',
    category: 'Networking',
    subject: 'Intro via Ansiversa community',
    body: `Hello {FirstName},

{MyName} here — we connected briefly during the launch roundtable. I loved your perspective on building practical AI
interfaces and thought it could be valuable to continue the conversation.

Would you be open to a short virtual coffee next week? I'd enjoy learning more about how you scale product education
at {Company} and swap notes on what we're building.

Warm regards,
{MyName}`,
  },
];

export const systemEmailTemplates: EmailTemplate[] = templates.map((template) =>
  createTemplate({
    ...template,
    userId: 'system',
    isSystem: true,
  }),
);

export function getTemplatesByCategory(category: EmailTemplateCategory) {
  return systemEmailTemplates.filter((template) => template.category === category);
}

export function findSystemTemplate(id: string) {
  return systemEmailTemplates.find((template) => template.id === id);
}
