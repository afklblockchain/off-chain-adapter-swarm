#!/bin/bash
#
# Download geth swarm and run it locally in singleton mode to enable tests.

# No need to do anything if swarm already runs.
nc -z localhost "8500"
if [ $? -eq 0 ]; then
    exit 0;
fi

GETH_VERSION="1.8.10-eae63c51"
BIN_DIR=/tmp/geth/geth-alltools-linux-386-$GETH_VERSION

# Download the swarm binary if necessary.
if [ ! -d $BIN_DIR ]; then
    mkdir -p /tmp/geth
    wget https://gethstore.blob.core.windows.net/builds/geth-alltools-linux-386-$GETH_VERSION.tar.gz -O /tmp/geth/geth.tar.gz
    tar --directory /tmp/geth -xvf /tmp/geth/geth.tar.gz
fi

# Prepare fixtures with an account.
DATADIR=/tmp/BZZ/`date +%s`
BZZKEY="71c95d6d54292609a62082249bccbebbf79a3f68"
PASSWORD="password"
mkdir -p $DATADIR
cp -R ./test/fixtures/swarm-keystore $DATADIR/keystore
echo $PASSWORD > /tmp/geth/password

# Run swarm.
$BIN_DIR/swarm --bzzaccount $BZZKEY --datadir $DATADIR --password /tmp/geth/password --ens-api '' 2>> $DATADIR/swarm.log &
