from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from pprint import pprint

import tensorflow as tf
import json

learnData = json.load(open('../DataSet/tfData.json'))
testData = json.load(open('../DataSet/tfTestData.json'))

pprint(learnData[0]['input'])
