# Winding Tree Off Chain Data Accessor - Ethereum Swarm.

Swarm-based storage that can be used in Winding Tree [wt-js-libs](https://github.com/windingtree/wt-js-libs).

## Installation

```sh
npm install @windingtree/off-chain-accessor-swarm
# or
git clone https://github.com/windingtree/off-chain-accessor-swarm
nvm install
npm install
```

## Usage

```javascript
import WTLibs from '@windingtree/wt-js-libs';
import SwarmAccessor from '@windingtree/off-chain-accessor-swarm';

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'http://localhost:8545',
  },
  offChainDataOptions: {
    accessors: {
      'bzz-raw': {
        options: {
          swarmProviderUrl: 'http://localhost:8500',
        }
        create: (options) => {
          return new SwarmAccessor(options);
        },
      },
    },
  },
});
```
