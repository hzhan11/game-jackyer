# USAGE
# python train.py --dataset dataset --model fashion.model --labelbin mlb.pickle

# set the matplotlib backend so figures can be saved in the background
import matplotlib
matplotlib.use("Agg")

# import the necessary packages
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import img_to_array
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from nets.simplenet import SimpleNet
import matplotlib.pyplot as plt
from imutils import paths
import numpy as np
import argparse
import random
import pickle
import cv2
import os
import pymongo
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint,ReduceLROnPlateau

basepath = r'C:\01_Works\game-jackyer\server\res'
training_folder = '.'

modelfile=training_folder+r'\game.h5'
labelbin=training_folder+r'\game.pickle'

EPOCHS = 100
INIT_LR = 1e-3
BS = 32
IMAGE_DIMS = (200, 120, 3)

def load_data():
	print("[INFO] loading images...")
	gjdb = pymongo.MongoClient("mongodb://localhost:8888/")['gamejackyer']

	data = []
	labels = []
	for item in gjdb['images'].find({'scenes': {'$ne':[]}}):
		image = cv2.imread(basepath+"\\"+item['url'])
		image = cv2.resize(image, (IMAGE_DIMS[1], IMAGE_DIMS[0]))
		image = img_to_array(image)
		data.append(image)
		labels.append(item['scenes'])

	data = np.array(data, dtype="float") / 255.0
	labels = np.array(labels)
	print("[INFO] class labels:")
	mlb = MultiLabelBinarizer()
	labels = mlb.fit_transform(labels)

	for (i, label) in enumerate(mlb.classes_):
		print("{}. {}".format(i + 1, label))

	print("training samples {} and testing samples {}".format(len(data),len(labels)))

	return data, labels, mlb

def train(X, Y, mlb):

	print("[INFO] compiling model...")

	model = SimpleNet.build(
		width=IMAGE_DIMS[1], height=IMAGE_DIMS[0],
		depth=IMAGE_DIMS[2], classes=len(mlb.classes_),
		finalact="sigmoid")

	opt = Adam(lr=INIT_LR, decay=INIT_LR / EPOCHS)
	model.compile(loss="binary_crossentropy", optimizer=opt,metrics=["accuracy"])

	#earlyStopping = EarlyStopping(monitor='val_loss', patience=10, verbose=0, mode='min')
	mcp_save = ModelCheckpoint(modelfile, save_best_only=True, monitor='val_accuracy', mode='max')
	#reduce_lr_loss = ReduceLROnPlateau(monitor='val_loss', factor=0.1, patience=7, verbose=1, epsilon=1e-4, mode='min')

	print("[INFO] training network...")
	if os.path.exists(modelfile):
		model.load_weights(modelfile)
	H = model.fit(X, Y, epochs=EPOCHS, verbose=1, validation_split=0.25, callbacks=[mcp_save])

	print("[INFO] serializing label binarizer...")
	f = open(labelbin, "wb")
	f.write(pickle.dumps(mlb))
	f.close()

	plt.style.use("ggplot")
	plt.figure()
	N = EPOCHS

	print(H.history)
	plt.plot(np.arange(0, N), H.history["loss"], label="train_loss")
	plt.plot(np.arange(0, N), H.history["val_loss"], label="val_loss")
	plt.plot(np.arange(0, N), H.history["accuracy"], label="train_acc")
	plt.plot(np.arange(0, N), H.history["val_accuracy"], label="val_acc")
	plt.title("Training Loss and Accuracy")
	plt.xlabel("Epoch #")
	plt.ylabel("Loss/Accuracy")
	plt.savefig("train.png")

X, Y, mlb = load_data()
train(X, Y, mlb)