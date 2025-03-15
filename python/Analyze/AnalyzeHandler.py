#-*- coding: utf-8 -*-

import json
from math import log
from typing import Dict
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin
from Utils.Utils import logE, logI

class AnalyzeHandler:

    def __init__(self, dataList):
        self.dataList = dataList
        self.pluginList: Dict[str, AnalyzePlugin] = {}

    def register(self, plugin: AnalyzePlugin):
        self.pluginList[plugin.tag] = plugin

    def analyze(self):
        for tag, plugin in self.pluginList.items():
            # try:
                plugin.startAnalyze()
            # except Exception as e:
                # logE(f'startAnalyze Error: {tag} {e}')

        for item in self.dataList:
            date = item['date']
            list = item['list']
            logI(f'Analyzing date={date}')
            for path in list:
                splitArray = path.split('/')
                platform = splitArray[0]
                country = splitArray[1]
                genreId = splitArray[3]
                logI(f'Analyzing path={path}')
                logI(f'platform={platform} country={country} genreId={genreId} date={date}')
                with open(path, 'r') as f:
                    data = json.load(f)
                    for tag, plugin in self.pluginList.items():
                        try:
                            plugin.handleItem(platform, country, genreId, date, data)
                        except Exception as e:
                            logE(f'handleItem Error: {tag} {e}')

        for tag, plugin in self.pluginList.items():
            try:
                plugin.endAnalyze()
            except Exception as e:
                logE(f'endAnalyze Error: {tag} {e}')
                plugin.forceWrite()
