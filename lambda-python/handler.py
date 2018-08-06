try:
  import unzip_requirements
except ImportError:
  pass
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
import json
import boto3
import numpy as np
import pickle
import StringIO
import boto3



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

    kohonen = StringIO.StringIO()
    s3.download_fileobj('antonsemenov-ai-files', 'kohonen-result.json', kohonen)

    prediction = model.predict(np.array([json.load(kohonen)]), batch_size=1)

    return {
        "result": json.dumps(prediction.tolist()[0]),
        "event": event,
    }
