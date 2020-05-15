from ppadb.client import Client as AdbClient
import os
import time
import uuid
import json
from glob import glob
from PIL import Image
import cv2

base_path = "public/res/"
image_path = base_path+ "img/"
url_path_for_server = "img/"
json_file = 'server/image.json'

tmp_file = 'res/tmp/tmp.png'
screen_file = 'res/tmp/screen.png'

def capture_screen(tmp=False):

    client = AdbClient(host="127.0.0.1", port=5037)
    device = client.device("emulator-5554")

    while True:
        res = device.screencap()
        now = time.strftime("%Y_%m_%d_%H_%M_%S",time.localtime(time.time())) 

        with open(tmp_file,"wb") as f:
            f.write(res)
        f.close()

        if tmp:
            pic_file = screen_file
        else:
            pic_file = image_path+now+".png"

        Image.open(tmp_file).resize((800,480)).save(pic_file)
        print(now)

def generate_json():

    image_json = {'images':[]}
    files = glob(image_path+"*.png")
    files.sort()
    for file in files:
        image = {
            "uuid":str(uuid.uuid1()),
            "url":url_path_for_server + file.split('/')[-1],
            "bboxs":[],
            "scenes":[]
        }
        image_json['images'].append(image)
    result = json.dumps(image_json, ensure_ascii=False, indent=4)
    print(result)
    
    with open(json_file,'w',encoding='utf-8') as f:
        f.write(result)

def display():
    with open(json_file,'r', encoding='utf-8') as f:
        jsonobj = json.load(f)
        for img in jsonobj['images']:
            im = cv2.imread('public/'+img['url'])
            bboxs = img['bboxs']
            if len(bboxs) != 0:
                for bbox in bboxs:
                    rect = bbox['rect']
                    print(rect)
                cv2.rectangle(im, (rect['left'], rect['top']), (rect['left']+rect['width'], rect['top']+rect['height']), (0, 255, 0), 2)
                cv2.imshow("haha",im)
                cv2.waitKey()

capture_screen(True)
#generate_json()
#display()