import PublisherClient from '@boilerz/amqp-helper/PublisherClient';
import mail from '@sendgrid/mail';
import url from 'url';
import User from '../model/user/User';
import config from '../config';

export const EXCHANGE_NAME = 'super-server-auth-core';
export interface EmailValidationMessage
  extends Pick<User, 'firstName' | 'lastName'> {
  email: string;
  validationCode: string;
}

let publisherClient: PublisherClient<EmailValidationMessage>;

export function getPublisherClient(): PublisherClient<EmailValidationMessage> {
  return publisherClient;
}

export async function setupEmailValidationPublisherClient(): Promise<void> {
  publisherClient = await PublisherClient.createAndSetupClient<
    EmailValidationMessage
  >({
    exchangeName: EXCHANGE_NAME,
  });
}

export async function sendValidationEmailRequest(
  message: EmailValidationMessage,
): Promise<void> {
  await publisherClient.publish(message);
}

export async function sendValidationEmail(
  message: EmailValidationMessage,
): Promise<void> {
  await mail.send({
    hideWarnings: true,
    templateId: config.sendgrid.mailTemplates.emailValidationId,
    from: config.sendgrid.senderEmail,
    to: message.email,
    dynamicTemplateData: {
      firstName: message.firstName,
      lastName: message.lastName,
      validationUrl: url.format({
        host: config.host,
        query: {
          email: message.email,
          validationCode: message.validationCode,
        },
      }),
    },
  });
}
