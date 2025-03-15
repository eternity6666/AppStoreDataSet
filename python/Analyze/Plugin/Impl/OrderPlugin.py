#-*- coding: utf-8 -*-

import json
import os
from typing import override
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin
from Utils.Utils import readJsonFrom, writeTo

class OrderPlugin(AnalyzePlugin):

    def __init__(self):
        super().__init__()
        self.filePath = 'simple/charts'
    
    @override
    def startAnalyze(self):
        if not os.path.exists(self.filePath):
            os.makedirs(self.filePath)
    
    @override
    def handleItem(self, platform, country, genreId, date, data):
        fileUrl = f'{self.filePath}/{date}.json'
        fileData = readJsonFrom(fileUrl) or {}
        result = []
        for item in data:
            appId = item['id'] or ''
            if len(appId) == 0:
                continue
            result.append(appId)
        if platform not in fileData:
            fileData[platform] = {}
        if genreId not in fileData[platform]:
            fileData[platform][genreId] = {}
        fileData[platform][genreId][country] = result
        writeTo(fileUrl, fileData)

    @override
    def endAnalyze(self):
        pass

    @override
    def forceWrite(self):
        pass
