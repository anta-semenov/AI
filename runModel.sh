cd tensorflow
source ./bin/activate

cd ..
cd node
yarn clean
yarn build
yarn prepare

cd ..
python ./tf.py

cd node
yarn evaluate
