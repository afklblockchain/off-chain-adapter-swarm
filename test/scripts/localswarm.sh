#!/bin/bash
#
# Download geth swarm and run it locally in singleton mode to enable tests.

# No need to do anything if swarm already runs.
nc -z localhost "8500"
if [ $? -eq 0 ]; then
    exit 0;
fi

BASE_DIR=`pwd`/swarm_data
GETH_VERSION="1.8.10-eae63c51"
ARCHITECTURE=amd64
BIN_DIR=$BASE_DIR/geth-alltools-linux-$ARCHITECTURE-$GETH_VERSION

# Download the swarm binary if necessary.
if [ ! -d $BIN_DIR ]; then
    mkdir -p $BASE_DIR
    wget https://gethstore.blob.core.windows.net/builds/geth-alltools-linux-$ARCHITECTURE-$GETH_VERSION.tar.gz -O $BASE_DIR/geth.tar.gz
    tar --directory $BASE_DIR -xvf $BASE_DIR/geth.tar.gz  geth-alltools-linux-$ARCHITECTURE-$GETH_VERSION/swarm
    rm $BASE_DIR/geth.tar.gz
fi

# Prepare fixtures with an account.
DATADIR=$BASE_DIR/BZZ/`date +%s`
BZZKEY="71c95d6d54292609a62082249bccbebbf79a3f68"
PASSWORD="password"
mkdir -p $DATADIR
cp -R ./test/fixtures/swarm-keystore $DATADIR/keystore
echo $PASSWORD > $BASE_DIR/password

# Run swarm.
$BIN_DIR/swarm --bzzaccount $BZZKEY --datadir $DATADIR --password $BASE_DIR/password --ens-api '' 2>> $DATADIR/swarm.log &

# Wait for the http listener to start; otherwise the test might fail.
echo "Waiting for the http listener to start..."
I=10
while [ $I -gt 0 ]; do
    nc -z localhost "8500"
    if [ $? -eq 0 ]; then
        exit 0;
    fi
    sleep 1
done
echo "ERROR: The http listener did not start in time."
exit 1
