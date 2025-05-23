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
        if country not in fileData[platform][genreId]:
            fileData[platform][genreId][country] = {}
        if fileName not in fileData[platform][genreId][country]:
            fileData[platform][genreId][country][fileName] = []
        result = fileData[platform][genreId][country][fileName]
        isDataChange = False
        for item in data:
            appId = item['id'] or ''
            if len(appId) == 0:
                continue
            if appId not in result:
                isDataChange = True
                result.append(appId)
        if isDataChange:
            fileData[platform][genreId][country][fileName] = result
            writeTo(fileUrl, fileData)
            self.tryUpdateDateList(date)

    def tryUpdateDateList(self, date):
        fileUrl = f'{self.filePath}/dateList.json'
        dateList = readJsonFrom(fileUrl) or []        
        if date not in dateList:
            dateList.append(date)
            writeTo(fileUrl, dateList)

    @override
    def endAnalyze(self):
        pass

    @override
    def forceWrite(self):
        pass
