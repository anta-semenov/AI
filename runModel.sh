#!/usr/bin/env bash

stage="$1"

cd tensorflow
source ./bin/activate
cd ..

if [ "$stage" == "0" ]; then
  cd node
  yarn clean
  yarn build
  yarn prepare
  cd ..
fi

python ./tf.py

cd node
yarn evaluate
