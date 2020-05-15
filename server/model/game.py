#import keras.backend.tensorflow_backend as tb 
#tb._SYMBOLIC_SCOPE.value = True

from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import argparse
import imutils
import pickle
import cv2
import os
import time
from imutils import paths


class Predictor:

	def __init__(self):
		model_file='model/game.h5'
		labelbin='model/game.pickle'
		self.model = load_model(model_file)
		self.mlb = pickle.loads(open(labelbin, "rb").read())

	def predict_from_file(self, img):
		image = cv2.imread(img)
		return self.predict(image)
	
	def predict(self, image):
		image = cv2.resize(image, (120, 200))
		image = image.astype("float") / 255.0
		image = img_to_array(image)
		image = np.expand_dims(image, axis=0)
		t1 = time.time()
		proba = self.model.predict(image)[0]
		t2 = time.time()
		#print(t2-t1)
		result = []
		for (label, p) in zip(self.mlb.classes_, proba):
			result.append({
				'scene': label, 
				'possible': "{:.2f}".format(p)}
			)
		return {'labels':result}