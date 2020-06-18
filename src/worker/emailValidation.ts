import logger from '@boilerz/logger';
import ConsumerClient from '@boilerz/amqp-helper/ConsumerClient';
import {
  EXCHANGE_NAME,
  EmailValidationMessage,
  sendValidationEmail,
} from '../helper/email';

let consumerClient: ConsumerClient<EmailValidationMessage>;

export function getConsumerClient(): ConsumerClient<EmailValidationMessage> {
  return consumerClient;
}

export async function start(): Promise<void> {
  consumerClient = await ConsumerClient.createAndSetupClient<
    EmailValidationMessage
  >({
    exchangeName: EXCHANGE_NAME,
    queueName: 'email-validation',
    nAckThrottle: 5000,
    async onMessageHandler(message, rootingKey): Promise<void> {
      logger.info({ message, rootingKey }, 'single handler consumer');
      await sendValidationEmail(message);
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
