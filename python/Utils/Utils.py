#-*- coding: utf-8 -*-
import os
import json
import datetime
import logging
from pickle import NONE

logDirs = 'logs'
logDate = datetime.datetime.now().strftime("%Y%m%d")

if not os.path.exists(logDirs):
    os.makedirs(logDirs)

logging.basicConfig(
    filename=f'{logDirs}/{logDate}.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
)

def readJsonFrom(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return None

def writeTo(path, data):
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    with open(path, 'w') as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False))
    logD(f'{path} is write success')

def logD(message):
    printForDebug(message)

def logI(message):
    logging.info(message)
    printForDebug(message)

def logE(message):
    logging.error(message)
    printForDebug(message)

def printForDebug(message):
    print(f'{datetime.datetime.now()}: {message}')