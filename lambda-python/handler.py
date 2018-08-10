import os
import sys
import json
import boto3
import pickle
import StringIO
HERE = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(HERE, "vendored"))

import numpy as np
from keras.models import Sequential
from keras.layers import LSTM, Lambda, Dense


def keras(event, context):
    s3 = boto3.client('s3', region_name='us-east-2')
    data = StringIO.StringIO()
    s3.download_fileobj('antonsemenov-ai-files', 'keras-weights', data)
    config = StringIO.StringIO()
    s3.download_fileobj('antonsemenov-ai-files', 'keras_config.json', config)

    modelConfig = json.loads(config.getvalue())
    modelWeights = pickle.loads(data.getvalue()) # np.load('./DataSet/keras_weights.npy')
    model = Sequential.from_config(modelConfig)
    model.set_weights(modelWeights)

    # kohonen = StringIO.StringIO()
    # s3.download_fileobj('antonsemenov-ai-files', 'kohonen-result.json', kohonen)

    prediction = model.predict(np.array([event]), batch_size=1)

    return {
        "result": json.dumps(prediction.tolist()[0]),
        "event": event,
    }
