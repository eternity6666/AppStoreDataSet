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
        self.developerToAppPath = f'{filePath}/developerToApp.json'
        self.appToDeveloperPath = f'{filePath}/appToDeveloper.json'

    def recordToDeveloperToApp(self, appId, developerId):
        if developerId not in self.developerToApp:
            self.developerToApp[developerId] = []
        if appId not in self.developerToApp[developerId]:
            self.developerToApp[developerId].append(appId)

    def recordToAppToDeveloper(self, developerId, appId):
        if appId not in self.appToDeveloper:
            self.appToDeveloper[appId] = []
        if developerId not in self.appToDeveloper[appId]:
            self.appToDeveloper[appId].append(developerId)

    @override
    def startAnalyze(self):
        self.developerToApp = readJsonFrom(self.developerToAppPath) or {}
        self.appToDeveloper = readJsonFrom(self.appToDeveloperPath) or {}

    @override
    def handleItem(self, platform, country, genreId, date, data):
        for item in data:
            appId = item['id']
            if len(appId) == 0:
                continue
            developerList = item.get('relationships', {}).get('developer', {}).get('data', [])
            if len(developerList) == 0:
                logE(f'No developer: {appId} {platform} {country} {genreId} {date}')
                continue
            for developer in developerList:
                developerId = developer.get('id')
                self.recordToDeveloperToApp(appId, developerId)
                self.recordToAppToDeveloper(developerId, appId)

    @override
    def endAnalyze(self):
        writeTo(self.developerToAppPath, self.developerToApp)
        writeTo(self.appToDeveloperPath, self.appToDeveloper)
    
    @override
    def forceWrite(self):
        pass
