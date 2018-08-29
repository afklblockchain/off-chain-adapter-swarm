# Winding Tree Off Chain Data Adapter - Ethereum Swarm.

[![Greenkeeper badge](https://badges.greenkeeper.io/windingtree/off-chain-adapter-swarm.svg)](https://greenkeeper.io/)

Swarm-based storage that can be used in Winding Tree [wt-js-libs](https://github.com/windingtree/wt-js-libs).

## Installation

```sh
npm install @windingtree/off-chain-adapter-swarm
# or
git clone https://github.com/windingtree/off-chain-adapter-swarm
nvm install
npm install
```

## Usage

```javascript
import WTLibs from '@windingtree/wt-js-libs';
import SwarmAdapter from '@windingtree/off-chain-adapter-swarm';

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'http://localhost:8545',
  },
  offChainDataOptions: {
    adapters: {
      'bzz-raw': {
        options: {
          swarmProviderUrl: 'http://localhost:8500',
        }
        create: (options) => {
          return new SwarmAdapter(options);
        },
      },
    },
  },
});
```

Optionally, you can provide a caching backend for the adapter to
avoid repeated requests. (Note: in this example, cache
expiration is not specified as bzz-raw resources are immutable.)

```javascript

import bluebird from 'bluebird';
import redis from 'redis';
bluebird.promisifyAll(redis.RedisClient.prototype);

const redisClient = redis.createClient();

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'http://localhost:8545',
  },
  offChainDataOptions: {
    adapters: {
      'bzz-raw': {
        options: {
          swarmProviderUrl: 'http://localhost:8500',
          cache: {
            set: (hash, dataJson) => redisClient.setAsync(hash, dataJson);
            get: (hash) => redisClient.getAsync(hash);
          }
        }
        create: (options) => {
          return new SwarmAdapter(options);
        },
      },
    },
  },
});
```
