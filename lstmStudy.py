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
    LSTM(50, input_shape=(20, 176)),
    # LSTM(50, return_sequences=True),
    Dense(22),
])

model.compile(optimizer='adam', loss='mean_squared_error', metrics=['accuracy'])

model.fit(np.array(trainInput)[0:3110], np.array(trainOutput)[0:3110], epochs=10, batch_size=10, shuffle=False)

np.save('./DataSet/keras_weights', model.get_weights())
with open('./DataSet/keras_config.json', 'w') as configFile:
    json.dump(model.get_config(), configFile)

testInput = []
testOutput = []
predictOutput = []
for dayData in testData:
    prediction = model.predict(np.array([dayData['input']]), batch_size=1)
    predictOutput.append({
        'prediction': prediction.tolist()[0],
        'raw': dayData['raw'],
    })

with open('./predictions.json', 'w') as outfile:
    json.dump(predictOutput, outfile)
