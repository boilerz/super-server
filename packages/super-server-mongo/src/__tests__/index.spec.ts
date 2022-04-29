import * as mongooseHelper from '@boilerz/mongoose-helper';

import plugin from '../index';

describe('Plugin', () => {
  describe('#setup', () => {
    it('should setup the plugin', async () => {
      const mongooseHelperConnectSpy = jest
        .spyOn(mongooseHelper, 'connect')
        .mockResolvedValue();

      await plugin.setup();

      expect(mongooseHelperConnectSpy).toHaveBeenCalled();
    });
  });

  describe('#tearDown', () => {
    it('should tear down the plugin', async () => {
      const mongooseHelperDisconnectSpy = jest
        .spyOn(mongooseHelper, 'disconnect')
        .mockResolvedValue(undefined);

      await plugin.tearDown();

      expect(mongooseHelperDisconnectSpy).toHaveBeenCalled();
    });
  });
});
