import url from 'url';

import mail from '@sendgrid/mail';

import PublisherClient from '@boilerz/amqp-helper/PublisherClient';

import config from '../config';
import User from '../model/user/User';

export const EXCHANGE_NAME = 'super-server-auth-core';

interface CommonMailMessage extends Pick<User, 'firstName' | 'lastName'> {
  email: string;
}

export interface EmailValidationMessage extends CommonMailMessage {
  validationCode: string;
}

export interface LinkAccountMessage extends CommonMailMessage {
  linkCode: string;
}

export type EmailMessage = EmailValidationMessage | LinkAccountMessage;

export type EmailRootingKey = 'emailValidation' | 'linkAccount';

let publisherClient: PublisherClient<EmailMessage, EmailRootingKey>;

export function getPublisherClient(): PublisherClient<
  EmailMessage,
  EmailRootingKey
> {
  return publisherClient;
}

export async function setupEmailValidationPublisherClient(): Promise<void> {
  publisherClient = await PublisherClient.createAndSetupClient<
    EmailMessage,
    EmailRootingKey
  >({
    amqpUrl: config.amqpUrl,
    exchangeName: EXCHANGE_NAME,
  });
}

export async function sendLinkAccountRequest(
  message: LinkAccountMessage,
): Promise<void> {
  await publisherClient.publish(message, 'linkAccount');
}

export async function sendLinkAccountEmail(
  message: LinkAccountMessage,
): Promise<void> {
  await mail.send({
    hideWarnings: true,
    templateId: config.sendgrid.mailTemplates.linkAccountId,
    from: config.sendgrid.senderEmail,
    to: message.email,
    dynamicTemplateData: {
      firstName: message.firstName,
      lastName: message.lastName,
      linkCode: message.linkCode,
    },
  });
}

export async function sendValidationEmailRequest(
  message: EmailValidationMessage,
): Promise<void> {
  await publisherClient.publish(message, 'emailValidation');
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
