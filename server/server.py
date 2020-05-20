from flask import Flask, request, Response
import json
import os
import time
import uuid
import json
from glob import glob
from PIL import Image
import cv2
from multiprocessing import Process
import numpy as np
import pymongo
import os
from device import Device
from model.game import Predictor
from gamebot import GameEngine

class WebServer:

   def __init__(self):

      self.gjdb = pymongo.MongoClient("mongodb://localhost:8888/")['gamejackyer']

      self.app = Flask(__name__, static_url_path='/', static_folder='res')
      self.app.after_request(self.after_request)
      
      self.app.add_url_rule('/', 'hello_world', self.hello_world)
      self.app.add_url_rule('/imageList','image_list', self.image_list)
      self.app.add_url_rule('/imageList/bboxName/<bboxName>','image_list_by_bbox', self.image_list_by_bbox)
      self.app.add_url_rule('/imageList/sceneList/<sList>','image_list_by_scene_list', self.image_list_by_scene_list)
      self.app.add_url_rule('/image/<uuid>','image_by_uuid',self.image_by_uuid)
      self.app.add_url_rule('/update/image','update_image',self.update_image,methods=['POST'])
      self.app.add_url_rule('/delete/images','delete_images',self.delete_images,methods=['POST'])
      self.app.add_url_rule('/update/imagescenes','update_imagescenes',self.update_imagescenes,methods=['POST'])
      self.app.add_url_rule('/device/screen/<rnd>','device_screen',self.device_screen)
      self.app.add_url_rule('/devices','device_list',self.device_list)
      self.app.add_url_rule('/device/input','device_input',self.device_input,methods=['POST'])
      self.app.add_url_rule('/device/screenctrl/<cmd>','device_screen_record',self.device_screen_record)
      self.app.add_url_rule('/device/mirror/<cmd>','device_screen_mirror',self.device_screen_mirror)
      self.app.add_url_rule('/predict/image/<uuid>','image_predict_by_uuid',self.image_predict_by_uuid)
      self.app.add_url_rule('/engine/act','engine_act_step',self.engine_act_step)

      self.dev = Device(self.gjdb)
      self.prd = Predictor()
      self.ge = GameEngine(self.dev,self.prd)
      self.screen_dump = False

   def after_request(self, response):
      response.headers['Access-Control-Allow-Origin'] = '*'
      response.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
      return response

   def hello_world(self):
      return {'mesg':'Hello World'}

   #@app.route(self, '/imageList')
   def image_list(self):
      return {'images':list(self.gjdb['images'].find())}

   #@app.route('/imageList/bboxName/<bboxName>')
   def image_list_by_bbox(self, bboxName):
      return {'images':list(self.gjdb['images'].find({
         'bboxs.name': {
            '$eq':bboxName
         }
      }))}
   
   #@app.route('/imageList/sceneList/<sList>')
   def image_list_by_scene_list(self, sList):
      if sList.count(',') != 0:
         sList = sList.split(',')
      return {'images':list(self.gjdb['images'].find({
         'scenes': {
            '$eq':sList
         }
      }))}

   #@app.route('/image/<uuid>')
   def image_by_uuid(self, uuid):
      found = self.gjdb['images'].find_one({'uuid':uuid})
      return found

   #@app.route("/update/imagescenes",methods=['POST'])
   def update_imagescenes(self):
      param = json.loads(request.get_data())
      s = param['start']
      e = param['end']
      sc = param['scenes']
      if s > e:
         return "err"
      self.gjdb['images'].update_many(
         { "_id" : { '$gte': s, '$lte': e } },
         { "$set": {'scenes':sc} }
      )
      return "ok"

   #@app.route("/delete/images",methods=['POST'])
   def delete_images(self):
      param = json.loads(request.get_data())
      s = param['start']
      e = param['end']
      if s > e:
         return "err"
      for image in self.gjdb['images'].find({ "_id" : { '$gte': s, '$lte': e } }):
         if os.path.exists(self.dev.path_base + image['url']):
            os.remove(self.dev.path_base + image['url'])
            print(self.dev.path_base + image['url'] + " removed")
      self.gjdb['images'].delete_many(
         { "_id" : { '$gte': s, '$lte': e } }
      )
      return "ok"
   
   #@app.route("/update/image",methods=['POST'])
   def update_image(self):
      image_to_add = json.loads(request.get_data())
      query = {'uuid':image_to_add['uuid']}
      new_data = { "$set": {'bboxs': image_to_add['bboxs'],'scenes':image_to_add['scenes']}}
      self.gjdb['images'].update_one(query,new_data)
      return "ok"

   def dump_screen(self, frame_raw):
      _id = int(time.time() * 1000)
      server_path = "img/" + str(_id) + ".png"
      dump_file = self.dev.res_path + "\\" + str(_id) + ".png"
      cv2.imwrite(dump_file, frame_raw)
      new_image = {
            '_id': _id,
            "uuid": str(uuid.uuid1()),
            "url": server_path,
            "bboxs": [],
            "scenes": []
      }
      self.gjdb['images'].insert_one(new_image)
      print(dump_file + " saved")

   #@app.route(self, '/devices')
   def device_list(self):
      return {'devices':self.dev.devconfig}

   #@app.route('/device/mirror/<cmd>')
   def device_screen_mirror(self,cmd):
      pass

   #@app.route('/device/screen/<rnd>')
   def device_screen(self,rnd):
      frame, frame_raw = self.dev.get_screen()
      print(self.screen_dump)
      if self.screen_dump:
         self.dump_screen(frame_raw)
      frame = (b'--frame\r\n'
              b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
      return Response(frame,mimetype='multipart/x-mixed-replace; boundary=frame')

   #@app.route('/device/screenctrl/<cmd>')
   def device_screen_record(self,cmd):
      print(cmd)
      if cmd == "start":
         self.screen_dump = True
      else:
         self.screen_dump = False
      return "ok"

   #@app.route("/device/input",methods=['POST'])
   #cmd param is: {'type': 'tap', 'param': 'x,y'}
   def device_input(self):
      recv = json.loads(request.get_data())
      self.dev.input(recv['type'], recv['param'])
      return "ok"

   #@app.route('/predict/image/<uuid>')
   def image_predict_by_uuid(self, uuid):
      if uuid == "null":
         _, frame_raw = self.dev.get_screen()
         result = self.prd.predict(frame_raw)
         return result
      else:
         found = self.gjdb['images'].find_one({'uuid':uuid})
         image = 'res/'+found['url']
         result = self.prd.predict_from_file(image)
         return result

   #@app.route('/engine/act')
   def engine_act_step(self):
      return {'mesg':self.ge.step()}

   def run(self):
      self.app.run(threaded=False)

if __name__ == '__main__':
   WebServer().run()