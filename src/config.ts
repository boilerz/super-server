export interface Config {
  host: string;
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
