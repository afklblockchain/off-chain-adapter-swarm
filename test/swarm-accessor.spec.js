import { assert } from 'chai';
import SwarmAccessor from '../src/swarm-accessor';

// This needs to be setup before running the tests externally; see:
//
// http://swarm-guide.readthedocs.io/en/latest/runninganode.html#swarm-in-singleton-mode.
const SWARM_PROVIDER_URL = 'http://localhost:8500';

describe('off-chain-data-accessor-swarm.SwarmAccessor', () => {
  const accessor = new SwarmAccessor({ swarmProviderUrl: SWARM_PROVIDER_URL });

  describe('upload', () => {
    it('should return a url of stored data', async () => {
      let url = await accessor.upload({ key: 'value' });
      assert.match(url, /bzz-raw:\/\/.+/);
    });
  });

  describe('download', () => {
    it('should return previously stored data', async () => {
      let url = await accessor.upload({ key2: 'value2' }),
        data = await accessor.download(url);
      assert.deepEqual(data, { key2: 'value2' });
    });

    it('should work well with non-ASCII characters', async () => {
      let url = await accessor.upload({ key2: 'diacřitićs and странные символы' }),
        data = await accessor.download(url);
      assert.deepEqual(data, { key2: 'diacřitićs and странные символы' });
    });

    // TODO: Solve this somehow.
    /* it('should return undefined if nothing was previously saved', async () => {
      let data = await accessor.download('bzz-raw://invalid-hash');
      assert.equal(data, undefined);
    }); */

    it('should fail if the url is ill-formed', async () => {
      try {
        await accessor.download('ajasdlkchjhh');
        throw new Error('Should have thrown an error');
      } catch (e) {}
    });

    it('should fail if the url scheme does not match expectations', async () => {
      try {
        await accessor.download('whatever://ajasdlkchjhh');
        throw new Error('Should have thrown an error');
      } catch (e) {}
    });
  });

  describe('update', () => {
    it('should always throw an error', async () => {
      try {
        let url = await accessor.upload({ key: 'value' });
        await accessor.update(url, { key: 'fail' });
        throw new Error('Should have thrown an error');
      } catch (e) {
        assert.equal(e.message, 'Cannot update data in Swarm; create a new record instead.');
      }
    });
  });
});
