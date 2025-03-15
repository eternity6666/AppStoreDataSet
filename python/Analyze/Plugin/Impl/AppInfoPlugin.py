#-*- coding: utf-8 -*-

import os
from typing import override
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin
from Utils.Utils import readJsonFrom, writeTo

class AppInfoPlugin(AnalyzePlugin):

    def __init__(self):
        super().__init__()
        self.filePath = 'simple/appInfo'
        self.notHandleKeyList = [
            "relationships",
            "meta",
            "genreDisplayName",
            "ariaLabelForRatings",
            "chartPositions",
            "userRating.value",
            "userRating.ratingCount",
            "editorialArtwork",
            "contentIconTrimmedMonochrome",
            "contentIconTrimmed",
            "brandLogo",
            "width",
            "height",
            "bgColor",
            "textColor1",
            "textColor2",
            "textColor3",
            "textColor4"
        ]
        self.keyListUrl = f'{self.filePath}/keyList.json'
        self.keyList = readJsonFrom(self.keyListUrl) or []
        self.advisoriesUrl = f'{self.filePath}/advisories.json'
        self.advisories = readJsonFrom(self.advisoriesUrl) or {}
    
    @override
    def startAnalyze(self):
        if not os.path.exists(self.filePath):
            os.makedirs(self.filePath)
    
    @override
    def handleItem(self, platform, country, genreId, date, data):
        def traverse_json(jsonObj, prefix = ''):
            keyValueDict = {}
            for key, value in jsonObj.items():
                full_key = f"{prefix}.{key}" if prefix else key
                if key in self.notHandleKeyList or full_key in self.notHandleKeyList:
                    continue
                if isinstance(value, dict):
                    keyValueDict.update(traverse_json(value, full_key)) 
                elif "contentRatingsBySystem.appsApple.advisories" == full_key:
                    newValue = []
                    for valueItem in value:
                        if valueItem not in self.advisories:
                            self.advisories[valueItem] = len(self.advisories)
                        newValue.append(self.advisories[valueItem])
                    keyValueDict.update({full_key: newValue})
                else:
                    keyValueDict.update({full_key: value})
            return keyValueDict

        for item in data:
            appId = item['id'] or ''
            if len(appId) == 0:
                continue
            fileUrl = f'{self.filePath}/{appId[0]}/{appId}.json'
            fileData = readJsonFrom(fileUrl) or {}
            isDataChange = False
            keyValueDict = traverse_json(item, '')
            for key, value in keyValueDict.items():
                if key not in self.keyList:
                    self.keyList.append(key)
                if key not in fileData:
                    fileData[key] = []
                newValue = fileData[key]
                targetItemIndex = next((i for i, x in enumerate(newValue) if x['k'] == value), -1)
                if targetItemIndex == -1:
                    newValue.append({'k': value, 'v': {}})
                    targetItemIndex = len(newValue) - 1
                targetItem = newValue[targetItemIndex]
                if platform not in targetItem['v']:
                    targetItem['v'][platform] = {}
                if country not in targetItem['v'][platform]:
                    targetItem['v'][platform][country] = []
                if date not in targetItem['v'][platform][country]:
                    targetItem['v'][platform][country].append(date)
                    isDataChange = True
                newValue[targetItemIndex] = targetItem
                fileData[key] = newValue

            if isDataChange:
                writeTo(fileUrl, fileData)

    @override
    def endAnalyze(self):
        writeTo(self.keyListUrl, self.keyList)
        writeTo(self.advisoriesUrl, self.advisories)

    @override
    def forceWrite(self):
        pass
