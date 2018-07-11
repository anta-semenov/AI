#!/usr/bin/env bash

deposit="$1"

cd tensorflow
source ./bin/activate
cd ..

cd node
yarn clean
yarn build
yarn prepareOperatingKohonen
cd ..

python ./kerasOperation.py

cd node
yarn describePedictions $deposit
