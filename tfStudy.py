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

model = Sequential([
    Dense(150, input_shape=(len(trainInput[0]),)),
    Dense(330),
    Dense(22, activation='sigmoid')
])

model.compile(optimizer='rmsprop', loss='mean_squared_error', metrics=['accuracy'])

model.fit(np.array(trainInput)[0:3230], np.array(trainOutput)[0:3230], epochs=100, batch_size=10)

np.save('./DataSet/keras_weights', model.get_weights())
with open('./DataSet/keras_config.json', 'w') as configFile:
    json.dump(model.get_config(), configFile)

predictOutput = []
for dayData in testData:
    prediction = model.predict(np.array([dayData['input']]), batch_size=1)
    predictOutput.append({
        'prediction': prediction.tolist()[0],
        'raw': dayData['raw'],
    })

with open('./predictions.json', 'w') as outfile:
    json.dump(predictOutput, outfile)
