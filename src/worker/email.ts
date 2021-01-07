import logger from '@boilerz/logger';
import ConsumerClient from '@boilerz/amqp-helper/ConsumerClient';
import mail from '@sendgrid/mail';
import assert from 'assert';
import {
  EXCHANGE_NAME,
  EmailValidationMessage,
  sendValidationEmail,
  EmailMessage,
  EmailRootingKey,
  LinkAccountMessage,
  sendLinkAccountEmail,
} from '../helper/email';
import config from '../config';

let consumerClient: ConsumerClient<EmailValidationMessage>;

export function getConsumerClient(): ConsumerClient<EmailValidationMessage> {
  return consumerClient;
}

export async function start(): Promise<void> {
  assert(config.host, 'SERVER_HOST need to be set');
  assert(config.sendgrid.apiKey, 'SENDGRID_API_KEY need to be set');
  assert(config.sendgrid.senderEmail, 'SENDER_EMAIL need to be set');
  assert(
    config.sendgrid.mailTemplates.emailValidationId,
    'EMAIL_VALIDATION_TEMPLATE_ID need to be set',
  );

  mail.setApiKey(config.sendgrid.apiKey);

  consumerClient = await ConsumerClient.createAndSetupClient<
    EmailMessage,
    EmailRootingKey
  >({
    amqpUrl: config.amqpUrl,
    exchangeName: EXCHANGE_NAME,
    queueName: 'email',
    nAckThrottle: 5000,
    onMessageHandlerByRootingKey: {
      async emailValidation(message: EmailValidationMessage): Promise<void> {
        logger.info({ message }, '[worker.email] Email validation');
        await sendValidationEmail(message);
      },
      async linkAccount(message: LinkAccountMessage): Promise<void> {
        logger.info({ message }, '[worker.email] Account linking');
        await sendLinkAccountEmail(message);
      },
    },
  });

  await consumerClient.consume();
}

export async function shutdown(signalOrError: string | Error): Promise<void> {
  if (signalOrError instanceof Error) {
    logger.error({ err: signalOrError }, '[shutdown] Uncaught exception');
  } else {
    logger.info(
      { signal: signalOrError },
      '[shutdown] Shutdown signal received',
    );
  }

  try {
    await consumerClient?.tearDown();
  } catch (err) {
    logger.error({ err }, '[shutdown] Shutdown failure');
  } finally {
    process.exit(0);
  }
}

/* istanbul ignore if */
if (!module.parent) {
  process
    .on('SIGTERM', shutdown)
    .on('SIGINT', shutdown)
    .on('uncaughtException', shutdown);

  start().then(() => logger.info('[emailValidation] - Started'));
}
