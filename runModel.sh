#!/usr/bin/env bash

stage="$1"

cd tensorflow
source ./bin/activate
cd ..

cd node
yarn clean
yarn build
cd ..

if [ "$stage" == "0" ] || [ "$stage" == "1" ]; then
  cd node
  yarn prepare
  cd ..
fi

if [ "$stage" == "1" ]; then
  cd node
  yarn kohonen
  cd ..
fi

if [ "$stage" == "0" ] || [ "$stage" == "1" ]; then
  cd node
  yarn prepareTf
  cd ..
fi

python ./tf.py

cd node
yarn evaluate
