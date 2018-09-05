import { assert } from 'chai';
import sinon from 'sinon';
import SwarmAdapter from '../src/index';

// This needs to be setup before running the tests externally; see:
//
// http://swarm-guide.readthedocs.io/en/latest/runninganode.html#swarm-in-singleton-mode.
const SWARM_PROVIDER_URL = 'http://localhost:8500';

describe('off-chain-data-adapter-swarm.SwarmAdapter', () => {
  const adapter = new SwarmAdapter({ swarmProviderUrl: SWARM_PROVIDER_URL });
  const _cache = {};
  const cache = {
    set: sinon.stub().callsFake((hash, data) => {
      _cache[hash] = data;
    }),
    get: sinon.stub().callsFake((hash) => _cache[hash]),
  };
  const cachedAdapter = new SwarmAdapter({
    swarmProviderUrl: SWARM_PROVIDER_URL,
    cache: cache,
  });

  describe('constructor', () => {
    it('should normalize the swarm provider url', () => {
      const adapter = new SwarmAdapter({ swarmProviderUrl: 'http://example-gateway.net/' });
      assert.equal(adapter.swarmProviderUrl, 'http://example-gateway.net');
    });
  });

  describe('upload', () => {
    it('should return a url of stored data', async () => {
      let url = await adapter.upload({ key: 'value' });
      assert.match(url, /bzz-raw:\/\/.+/);
    });

    it('should store the uploaded data in cache if provided', async () => {
      cache.set.resetHistory();
      await cachedAdapter.upload({ key: 'value' });
      assert.equal(cache.set.callCount, 1);
      assert.equal(cache.set.args[0][1], [JSON.stringify({ key: 'value' })]);
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

    it('should utilize the cache if provided', async () => {
      // Use the non-cached adapter to avoid cache upon upload.
      let url = await adapter.upload({ key: 'value3' });
      cache.get.resetHistory();
      cache.set.resetHistory();
      await cachedAdapter.download(`${url}/`);
      assert.equal(cache.get.callCount, 1);
      assert.equal(cache.set.callCount, 1);
      await cachedAdapter.download(`${url}/`);
      assert.equal(cache.get.callCount, 2);
      assert.equal(cache.set.callCount, 1);
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
