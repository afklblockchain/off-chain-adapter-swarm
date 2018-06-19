# Winding Tree Off Chain Data Adapter - Ethereum Swarm.

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
