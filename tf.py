from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from pprint import pprint
import numpy as np

import json

from keras.models import Sequential
from keras.layers import LSTM, Lambda, Dense

learnData = json.load(open('./DataSet/tfData.json'))
testData = json.load(open('./DataSet/tfTestData.json'))

def loss(outputTrue, outputPredict):
    pprint('++++++++' + outputPredict)
    result = 0
    for i in range(22):
        if outputTrue[i] == 0 and outputPredict[i] == 1:
            result += 3
        elif outputTrue[i] == 1 and outputPredict[i] == 0:
            result +=1
    return result

def activation(x):
    pprint(x)
    if x > 0.7:
        return 1
    else:
        return 0

trainInput = []
trainOutput = []
for dayData in learnData:
    trainInput.append(dayData['input'])
    trainOutput.append(dayData['output'])

model = Sequential([
    Dense(44, input_shape=(330,)),
    Dense(22)
])

model.compile(optimizer='rmsprop', loss='mean_squared_error', metrics=['accuracy'])

model.fit(np.array(trainInput)[0:1932], np.array(trainOutput)[0:1932], epochs=100, batch_size=21)
testInput = []
testOutput = []
predictOutput = []
for dayData in testData:
    prediction = model.predict(np.array([dayData['input']]), batch_size=1)
    predictOutput.append(prediction.tolist()[0])

with open('./predictions.json', 'w') as outfile:
    json.dump(predictOutput, outfile)
