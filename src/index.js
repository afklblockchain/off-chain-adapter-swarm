// @flow

import Web3Bzz from 'web3-bzz';

/**
 * Off-chain data adapter based on Ethereum Swarm.
 */
class SwarmAdapter {
  buzz: Web3Bzz;

  constructor (options: {| swarmProviderUrl: string |}) {
    this.buzz = new Web3Bzz(options.swarmProviderUrl);
  }

  _getHash (url: string): string {
    const matchResult = url.match(/^([a-zA-Z-]+):\/\/(.+)/i);
    if (!matchResult || matchResult.length < 2) {
      throw new Error(`Invalid url: ${url}`);
    }
    if (matchResult[1].toLowerCase() !== 'bzz-raw') {
      throw new Error(`Invalid url scheme: ${matchResult[1]} ('bzz-raw' expected).`);
    }
    return matchResult[2];
  }

  /**
   * Serialize the input data to JSON before upload.
   * @return {string} Resulting JSON.
   */
  static _serialize (data: Object): string {
    return JSON.stringify(data);
  }

  /**
   * Deserialize the data obtained from swarm.
   * @return {Object} Resulting object.
   */
  static _deserialize (data: Uint8Array): Object {
    // Convert data from Uint8Array to UTF-8 and parse as JSON.
    let encodedString = String.fromCharCode.apply(null, data),
      decodedString = decodeURIComponent(escape(encodedString));
    return JSON.parse(decodedString);
  }

  /**
   * Retrieves data stored under a hash derived from url `bzz-raw://<hash>`
   * @throws {Error} When hash cannot be detected.
   */
  async download (url: string): Promise<?Object> {
    let hash = this._getHash(url),
      dataRaw = await this.buzz.download(hash);
    return SwarmAdapter._deserialize(dataRaw);
  }

  /**
   * Stores data in swarm.
   * @return {string} Resulting url such as `bzz-raw://<hash>`
   */
  async upload (data: Object): Promise<string> {
    let dataRaw = SwarmAdapter._serialize(data),
      hash = await this.buzz.upload(dataRaw);
    return `bzz-raw://${hash}`;
  }
  
  /**
   * Swarm records are immutable.
   */
  async update (url: string, data: Object): Promise<string> {
    throw new Error('Cannot update data in Swarm; create a new record instead.');
  }
}

export default SwarmAdapter;
