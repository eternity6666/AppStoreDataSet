#-*- coding: utf-8 -*-

import os
from typing import override
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin
from Utils.Utils import readJsonFrom, logI, logE, writeTo

class DeveloperPlugin(AnalyzePlugin):
    def __init__(self):
        super().__init__()
        filePath = 'simple/developer'
        if not os.path.exists(filePath):
            os.makedirs(filePath)
        self.typeListPath = f'{filePath}/typeList.json'
        self.developerToAppPath = f'{filePath}/developerToApp.json'

    @override
    def startAnalyze(self):
        self.typeList = readJsonFrom(self.typeListPath) or []
        self.developerToApp = readJsonFrom(self.developerToAppPath) or {}
        self.appToDeveloper = {}

    @override
    def handleItem(self, platform, country, genreId, date, data):
        for item in data:
            appId = item['id']
            developerList = item.get('relationships', {}).get('developer', {}).get('data', [])
            if len(developerList) == 0:
                logE(f'No developer: {appId} {platform} {country} {genreId} {date}')
                continue
            for developer in developerList:
                developerId = developer.get('id')
                developerType = developer.get('type') 
                if developerType not in self.typeList:
                    self.typeList.append(developerType)
                developerTypeId = self.typeList.index(developerType)
                if developerId not in self.developerToApp:
                    self.developerToApp[developerId] = [developerTypeId, []]
                elif self.developerToApp[developerId][0] != developerTypeId:
                    logI(f'Developer type mismatch: {developerId} {self.developerToApp[developerId][0]} {developerTypeId}')
                appList = self.developerToApp[developerId][1]
                if appId not in appList:
                    appList.append(appId)
                    appList.sort()
                    self.developerToApp[developerId][1] = appList

    @override
    def endAnalyze(self):
        writeTo(self.typeListPath, self.typeList)
        self.developerToApp = dict(sorted(self.developerToApp.items(), key=lambda x: x[0]))
        writeTo(self.developerToAppPath, self.developerToApp)
    
    @override
    def forceWrite(self):
        writeTo(self.developerToAppPath, self.developerToApp)
        writeTo(self.typeListPath, self.typeList)
