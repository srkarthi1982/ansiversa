import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { renderTemplate as renderEmailTemplate } from '../../lib/email/generator';
import { EmailVariablesSchema } from '../../lib/email/schema';
import { findSignatureForUser, findTemplateForUser, requireUser } from './utils';

const inlineTemplateSchema = z.object({
  subject: z.string().max(120).optional().nullable(),
  body: z.string().min(1).max(20000),
});

export const renderTemplate = defineAction({
  accept: 'json',
  input: z
    .object({
      templateId: z.string().uuid().optional(),
      template: inlineTemplateSchema.optional(),
      variables: EmailVariablesSchema.optional(),
      signature: z.boolean().default(true),
    })
    .refine((value) => Boolean(value.templateId || value.template), {
      message: 'Provide a templateId or template body to render.',
      path: ['template'],
    }),
  async handler({ templateId, template, variables, signature }, ctx) {
    const user = await requireUser(ctx);

    const baseTemplate = templateId
      ? await findTemplateForUser(templateId, user.id)
      : inlineTemplateSchema.parse(template!);

    const signatureBlock = signature ? await findSignatureForUser(user.id) : null;
    const rendered = renderEmailTemplate({
      subject: template?.subject ?? baseTemplate.subject ?? null,
      body: template?.body ?? baseTemplate.body,
      variables,
      signature: signatureBlock?.enabled ? signatureBlock.display : null,
    });

    return rendered;
  },
});
