#!/usr/bin/env bash

stage="$1"
# stage 0 - just run saved model on data
# stage 1 - teach new keras model over prepared kohonen data
# stage 2 - teach all networks

cd tensorflow
source ./bin/activate
cd ..

if [ "$stage" == "0" ] || [ "$stage" == "1" ]; then
  cd node
  yarn clean
  yarn build
  cd ..
fi

if [ "$stage" == "0" ] || [ "$stage" == "1" ]; then
  cd node
  yarn prepareData
  yarn prepareLSTMInput
  cd ..
fi

if [ "$stage" == "1" ] || [ "$stage" == "2" ]; then
  python ./lstmStudy.py
fi

if [ "$stage" == "0" ]; then
  python ./tf.py
fi


cd node
yarn evaluate
cd ..
