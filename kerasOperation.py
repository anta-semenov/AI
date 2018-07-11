from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from pprint import pprint
import numpy as np

import json

from keras.models import Sequential
from keras.layers import LSTM, Lambda, Dense

kohonen = json.load(open('./OperatingData/kohonenOutput.json'))

json_data=open('./DataSet/keras_config.json').read()
modelConfig = json.loads(json_data)
modelWeights = np.load('./DataSet/keras_weights.npy')
model = Sequential.from_config(modelConfig)
model.set_weights(modelWeights)

prediction = model.predict(np.array([kohonen]), batch_size=1)

with open('./OperatingData/prediction.json', 'w') as outfile:
    json.dump(prediction.tolist()[0], outfile)
