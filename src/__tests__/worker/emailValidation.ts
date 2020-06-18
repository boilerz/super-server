import mail from '@sendgrid/mail';
import * as emailValidationWorker from '../../worker/emailValidation';
import * as emailHelper from '../../helper/email';

describe('[worker] emailValidation', () => {
  let processExitSpy: jest.SpyInstance;
  const message = {
    email: 'john@doe.com',
    validationCode: '42',
    firstName: 'John',
    lastName: 'Doe',
  };
  beforeAll(async () => {
    await emailHelper.setupEmailValidationPublisherClient();
  });
  afterAll(async () => {
    await emailHelper.getPublisherClient().tearDown();
  });

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockReturnThis();
  });

  it('should handle a send validation email request', async () => {
    const mailSendSpy = jest.spyOn(mail, 'send').mockReturnThis();

    await emailValidationWorker.start();
    await emailHelper.sendValidationEmailRequest(message);
    await emailValidationWorker.getConsumerClient().waitEmptiness();
    await emailValidationWorker.shutdown('SIGINT');

    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(mailSendSpy).toMatchSnapshot();
  });
});
