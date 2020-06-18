export interface Config {
  host: string;
  emailValidationExpiresDuration: number;
  waitingDurationBeforeNextEmailAttempt: number;
  sendgrid: {
    apiKey: string;
    senderEmail: string;
    mailTemplates: {
      emailValidationId: string;
    };
  };
}

const config: Config = {
  host: process.env.SERVER_HOST || 'http://localhost:3000',
  emailValidationExpiresDuration: parseInt(
    process.env.EMAIL_VALIDATION_EXPIRES_DURATION || '48',
    10,
  ),
  waitingDurationBeforeNextEmailAttempt: parseInt(
    process.env.WAITING_DURATION_BEFORE_NEXT_EMAIL_ATTEMPT || '5000',
    10,
  ),
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    senderEmail: process.env.SENDER_EMAIL!,
    mailTemplates: {
      emailValidationId: process.env.EMAIL_VALIDATION_TEMPLATE_ID!,
    },
  },
};

export default config;
