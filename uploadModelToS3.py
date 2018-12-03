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

json_data=open('./DataSet/keras_config.json').read()
modelConfig = json.loads(json_data) #
modelWeights =  np.load('./DataSet/keras_weights.npy') #
model = Sequential.from_config(modelConfig)
model.set_weights(modelWeights)

with open('./temp', 'w') as outfile:
    pickle.dump(model.get_weights(), outfile)

s3 = boto3.client(
    's3',
    aws_access_key_id='',
    aws_secret_access_key='',
    region_name='us-east-2'
)

with open('./temp', 'rb') as data:
    s3.upload_fileobj(data, 'antonsemenov-ai-files', 'keras-weights')
