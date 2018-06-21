// @flow

import request from 'xhr-request';

/**
 * Off-chain data adapter based on Ethereum Swarm.
 */
class SwarmAdapter {
  swarmProviderUrl: string;

  constructor (options: {| swarmProviderUrl: string |}) {
    this.swarmProviderUrl = options.swarmProviderUrl;
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
    return new Promise((resolve, reject) => {
      request(`${this.swarmProviderUrl}/bzz-raw:/${hash}`, {}, (err, data, response) => {
        if (err) {
          return reject(err);
        } else if (response.statusCode >= 400) {
          return reject(new Error(`Error ${response.statusCode}.`));
        }
        return resolve(JSON.parse(data));
      });
    });
  }

  /**
   * Stores data in swarm.
   * @return {string} Resulting url such as `bzz-raw://<hash>`
   */
  async upload (data: Object): Promise<string> {
    let url = `${this.swarmProviderUrl}/bzz-raw:/`;
    let params = {
      body: JSON.stringify(data),
      method: 'POST',
    };
    return new Promise((resolve, reject) => {
      request(url, params, (err, data, response) => {
        if (err) {
          return reject(err);
        } else if (response.statusCode >= 400) {
          return reject(new Error(`Error ${response.statusCode}.`));
        }
        return resolve(`bzz-raw://${data}`);
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
