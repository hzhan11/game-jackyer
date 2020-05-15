import os
import threading
from device import Device
from model.game import Predictor
import pymongo
import time

class GameEngine:

    def __init__(self, dev, pre):
        self.device = dev
        self.predictor = pre

        self.timer_all = 0
        self.timer_this_scene = 0
        #t = threading.Thread(target=self.run)
        #t.start()
        #t.join()

    def g_main_run(self, context):
        self.device.input("tap", "149,411")
        self.device.input("tap", "1213,798")
        return("running")

    def g_main_fight(self, context):
        return("fighting")

    def g_main_talk(self, context):
        self.device.input("tap", "1325,742")
        self.device.input("tap", "1440,423")
        #self.device.input("tap", "800,573")
        return("talking")

    def g_story(self, context):
        return("story to skip")

    def g_misc(self, context):
        return("act manually")

    def act(self, context):
        if context.count("main") == 1 and context.count("talk") == 1:
            return self.g_main_talk(context)
        elif context.count("main") == 1 and context.count("run") == 1:
            return self.g_main_run(context)
        elif context.count("main") == 1 and context.count("fight") == 1:
            return self.g_main_fight(context)
        elif context.count("story") == 1:
            return self.g_story(context)
        elif context.count("misc") == 1:
            return self.g_misc(context)
        else:
            return "unknown"

    def judge_scene(self, result):
        s_list = []
        for s in result['labels']:
            if float(s['possible']) > 0.8:
                s_list.append(s['scene'])
        return s_list

    def get_context(self):
        _ , s = self.device.get_screen()
        result = self.predictor.predict(s)
        context = self.judge_scene(result)
        return context

    def step(self):
        c = self.get_context()
        return self.act(c)

    def run(self):
        while True:
            self.step()
            

if __name__ == "__main__":
    gjdb = pymongo.MongoClient("mongodb://localhost:8888/")['gamejackyer']
    dev = Device(gjdb)
    pre = Predictor()
    GameEngine(dev,pre).run()