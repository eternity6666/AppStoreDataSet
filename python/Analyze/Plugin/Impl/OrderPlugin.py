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
    def handleItem(self, platform, country, genreId, date, fileName, data):
        fileUrl = f'{self.filePath}/{date}.json'
        fileData = readJsonFrom(fileUrl) or {}
        if platform not in fileData:
            fileData[platform] = {}
        if genreId not in fileData[platform]:
            fileData[platform][genreId] = {}
        if country not in fileData[platform][genreId][country]:
            fileData[platform][genreId][country] = {}
        if fileName not in fileData[platform][genreId][country]:
            fileData[platform][genreId][country][fileName] = []
        result = fileData[platform][genreId][country][fileName]
        for item in data:
            appId = item['id'] or ''
            if len(appId) == 0:
                continue
            result.append(appId)
        fileData[platform][genreId][country][fileName] = result
        writeTo(fileUrl, fileData)

    @override
    def endAnalyze(self):
        pass

    @override
    def forceWrite(self):
        pass
