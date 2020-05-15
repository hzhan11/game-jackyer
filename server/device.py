from ppadb.client import Client as AdbClient
import os
import cv2
import numpy as np
import threading
from pathlib import Path

class Device:

   def __init__(self, gjdb):

      self.path_base = str(Path("C:/01_Works/game-jackyer/server/res/"))
      self.res_path = str(Path("C:/01_Works/game-jackyer/server/res/img/"))
      self.default_screen_file = str(Path("C:/01_Works/game-jackyer/server/res/tmp/screen.png"))
      self.devconfig = list(gjdb['devices'].find())

      os.system("adb kill-server")
      os.system("adb devices")
      self.client = AdbClient(host="127.0.0.1", port=5037)
      self.device = self.client.device(self.devconfig[0]["serial"])

      self.dscreen_png = cv2.imread(self.default_screen_file)
      self.dscreen_png = cv2.imencode('.png',self.dscreen_png)[1]
      self.dscreen_png = self.dscreen_png.tostring()

      self.screen = None
      self.screen_png = None

      self.rlock = threading.RLock()
      t = threading.Thread(target=self.screen_monitor)
      t.start()
   
   def screen_monitor(self):
      while True:
         self.frame()

   def default_screen(self):
      return self.dscreen_png

   def get_screen(self):
      with self.rlock:
         return self.screen_png, self.screen

   def frame(self):
      screen = self.device.screencap()
      screen = np.asarray(bytearray(screen), dtype="uint8")
      screen = cv2.imdecode(screen, cv2.IMREAD_COLOR)
      screen = cv2.resize(screen,(800,480))
      screen_png = cv2.imencode('.png',screen)[1]
      screen_png = screen_png.tostring()
      with self.rlock:
         self.screen = screen
         self.screen_png = screen_png
   
   def input(self, type, param):
      if type == "tap":
         x = param.split(',')[0]
         y = param.split(',')[1]
         self.device.input_tap(x,y)