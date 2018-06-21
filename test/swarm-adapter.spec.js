import { assert } from 'chai';
import SwarmAdapter from '../src/index';

// This needs to be setup before running the tests externally; see:
//
// http://swarm-guide.readthedocs.io/en/latest/runninganode.html#swarm-in-singleton-mode.
const SWARM_PROVIDER_URL = 'http://localhost:8500';

describe('off-chain-data-adapter-swarm.SwarmAdapter', () => {
  const adapter = new SwarmAdapter({ swarmProviderUrl: SWARM_PROVIDER_URL });

  describe('upload', () => {
    it('should return a url of stored data', async () => {
      let url = await adapter.upload({ key: 'value' });
      assert.match(url, /bzz-raw:\/\/.+/);
    });
  });

  describe('download', () => {
    it('should return previously stored data', async () => {
      let url = await adapter.upload({ key2: 'value2' }),
        data = await adapter.download(url);
      assert.deepEqual(data, { key2: 'value2' });
    });

    it('should work well with non-ASCII characters', async () => {
      let url = await adapter.upload({ key2: 'diacřitićs and странные символы' }),
        data = await adapter.download(url);
      assert.deepEqual(data, { key2: 'diacřitićs and странные символы' });
    });

    it('should work well with trailing slashes', async () => {
      let url = await adapter.upload({ key2: 'value2' }),
        data = await adapter.download(`${url}/`);
      assert.deepEqual(data, { key2: 'value2' });
    });

    it('should fail when the hash is non-existent', async () => {
      try {
        await adapter.download('bzz-raw://invalid-hash');
        throw new Error('Should have thrown an error');
      } catch (e) {
        assert.include(e.message, 'Error 404');
      }
    });

    it('should fail if the url is ill-formed', async () => {
      try {
        await adapter.download('ajasdlkchjhh');
        throw new Error('Should have thrown an error');
      } catch (e) {
        assert.include(e.message, 'Invalid url');
      }
    });

    it('should fail if the url scheme does not match expectations', async () => {
      try {
        await adapter.download('whatever://ajasdlkchjhh');
        throw new Error('Should have thrown an error');
      } catch (e) {
        assert.include(e.message, 'Invalid url scheme');
      }
    });
  });

  describe('update', () => {
    it('should always throw an error', async () => {
      try {
        let url = await adapter.upload({ key: 'value' });
        await adapter.update(url, { key: 'fail' });
        throw new Error('Should have thrown an error');
      } catch (e) {
        assert.equal(e.message, 'Cannot update data in Swarm; create a new record instead.');
      }
    });
  });
});
