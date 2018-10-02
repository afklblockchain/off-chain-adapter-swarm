// @flow

import request from 'xhr-request';

/**
 */
type CacheType = {
  set: (hash: string, dataJson: string) => Promise<void>,
  get: (hash: string) => Promise<string>
};

/**
 * Off-chain data adapter based on Ethereum Swarm.
 */
class SwarmAdapter {
  swarmProviderUrl: string;
  cache: ?CacheType;
  timeout: ?number;

  constructor (options: {| swarmProviderUrl: string, cache?: CacheType, timeout?: number |}) {
    this.swarmProviderUrl = options.swarmProviderUrl.replace(/\/+$/, '');
    this.cache = options.cache;
    this.timeout = options.timeout;
  }

  static _getHash (url: string): string {
    const matchResult = url.match(/^([a-zA-Z-]+):\/\/([a-zA-Z0-9]+)\/?/i);
    if (!matchResult || matchResult.length < 2) {
      throw new Error(`Invalid url: ${url}`);
    }
    if (matchResult[1].toLowerCase() !== 'bzz-raw') {
      throw new Error(`Invalid url scheme: ${matchResult[1]} ('bzz-raw' expected).`);
    }
    return matchResult[2];
  }

  /**
   * Retrieves data stored under a hash derived from url `bzz-raw://<hash>`
   * @throws {Error} When hash cannot be detected.
   */
  async download (bzzUrl: string): Promise<?Object> {
    let hash = SwarmAdapter._getHash(bzzUrl);
    if (this.cache) {
      let dataJson = await this.cache.get(hash);
      if (dataJson) {
        return JSON.parse(dataJson);
      }
    }
    return new Promise((resolve, reject) => {
      request(`${this.swarmProviderUrl}/bzz-raw:/${hash}`, {
        timeout: this.timeout,
      }, (err, dataJson, response) => {
        if (err) {
          return reject(err);
        } else if (response.statusCode >= 400) {
          return reject(new Error(`Error ${response.statusCode}.`));
        }
        try {
          const parsedData = JSON.parse(dataJson);
          // Cache only proper JSON data
          if (this.cache) {
            this.cache.set(hash, dataJson); // No need to block here.
          }
          return resolve(parsedData);
        } catch (e) {
          return reject(e);
        }
      });
    });
  }

  /**
   * Stores data in swarm.
   * @return {string} Resulting url such as `bzz-raw://<hash>`
   */
  async upload (data: Object): Promise<string> {
    let url = `${this.swarmProviderUrl}/bzz-raw:/`;
    let dataJson = JSON.stringify(data);
    let params = {
      body: dataJson,
      method: 'POST',
      timeout: this.timeout,
    };
    return new Promise((resolve, reject) => {
      request(url, params, (err, hash, response) => {
        if (err) {
          return reject(err);
        } else if (response.statusCode >= 400) {
          return reject(new Error(`Error ${response.statusCode}.`));
        }
        if (this.cache) {
          this.cache.set(hash, dataJson); // No need to block here.
        }
        return resolve(`bzz-raw://${hash}`);
      });
    });
  }
  
  /**
   * Swarm records are immutable.
   */
  async update (url: string, data: Object): Promise<string> {
    throw new Error('Cannot update data in Swarm; create a new record instead.');
  }
}

export default SwarmAdapter;
