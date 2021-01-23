import mail from '@sendgrid/mail';
import * as emailWorker from '../../worker/email';
import * as emailHelper from '../../helper/email';

describe('[worker] emailValidation', () => {
  let processExitSpy: jest.SpyInstance;
  const message = {
    email: 'john@doe.com',
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

    await emailWorker.start();
    await emailHelper.sendValidationEmailRequest({
      ...message,
      validationCode: '42',
    });
    await emailWorker.getConsumerClient().waitEmptiness();
    await emailWorker.shutdown('SIGINT');

    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(mailSendSpy).toHaveBeenCalledWith({
      dynamicTemplateData: {
        firstName: 'John',
        lastName: 'Doe',
        validationUrl:
          'http://localhost:3000?email=john%40doe.com&validationCode=42',
      },
      from: 'john.sender@doe.co',
      hideWarnings: true,
      templateId: 'dummy-email-validation-id',
      to: 'john@doe.com',
    });
  });

  it('should handle a send link code email request', async () => {
    const mailSendSpy = jest.spyOn(mail, 'send').mockReturnThis();

    await emailWorker.start();
    await emailHelper.sendLinkAccountRequest({
      ...message,
      linkCode: '15',
    });
    await emailWorker.getConsumerClient().waitEmptiness();
    await emailWorker.shutdown('SIGINT');

    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(mailSendSpy).toHaveBeenCalledWith({
      dynamicTemplateData: {
        firstName: 'John',
        lastName: 'Doe',
        linkCode: '15',
      },
      from: 'john.sender@doe.co',
      hideWarnings: true,
      templateId: 'dummy-link-account-id',
      to: 'john@doe.com',
    });
  });
});
