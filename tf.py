from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from pprint import pprint
import numpy as np
import pickle
import StringIO
import boto3

import json

from keras.models import Sequential
from keras.layers import LSTM, Lambda, Dense

learnData = json.load(open('./DataSet/tfData.json'))
testData = json.load(open('./DataSet/tfTestData.json'))

trainInput = []
trainOutput = []
for dayData in learnData:
    trainInput.append(dayData['input'])
    trainOutput.append(dayData['output'])

# model = Sequential([
#     Dense(120, input_shape=(352,)),
#     Dense(50),
#     Dense(22)
# ])
#
# model.compile(optimizer='rmsprop', loss='mean_squared_error', metrics=['accuracy'])
#
# model.fit(np.array(trainInput)[0:1701], np.array(trainOutput)[0:1701], epochs=100, batch_size=21)
#
# np.save('./DataSet/keras_weights', model.get_weights())
# with open('./DataSet/keras_config.json', 'w') as configFile:
#     json.dump(model.get_config(), configFile)

# s3 = boto3.client(
#     's3',
#     aws_access_key_id='',
#     aws_secret_access_key='',
#     region_name='us-east-2'
# )
# data = StringIO.StringIO()
# s3.download_fileobj('antonsemenov-ai-files', 'keras-weights', data)
#
# config = StringIO.StringIO()
# s3.download_fileobj('antonsemenov-ai-files', 'keras_config.json', config)

json_data=open('./DataSet/keras_config.json').read()
modelConfig = json.loads(json_data) #
modelWeights = np.load('./DataSet/keras_weights.npy') #
model = Sequential.from_config(modelConfig)
# model.set_weights(modelWeights)

with open('./temp', 'w') as outfile:
    pickle.dump(modelWeights, outfile)

with open('./temp', 'rb') as data:
    modelWeights1 = pickle.load(data)

model.set_weights(modelWeights1)

testInput = []
testOutput = []
predictOutput = []
for dayData in testData:
    prediction = model.predict(np.array([dayData['input']]), batch_size=1)
    predictOutput.append(prediction.tolist()[0])

with open('./predictions.json', 'w') as outfile:
    json.dump(predictOutput, outfile)

# with open('./temp', 'w') as outfile:
#     pickle.dump(model.get_weights(), outfile)
#
# with open('./temp', 'rb') as data:
#     s3.upload_fileobj(data, 'antonsemenov-ai-files', 'keras-weights')
