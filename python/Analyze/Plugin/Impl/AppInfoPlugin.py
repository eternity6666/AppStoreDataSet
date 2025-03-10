#-*- coding: utf-8 -*-

from typing import override
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin

class AppInfoPlugin(AnalyzePlugin):

    def __init__(self):
        super().__init__()
        self.filePath = 'simple/appInfo'
    
    @override
    def startAnalyze(self):
        if not os.path.exists(self.filePath):
            os.makedirs(self.filePath)
        self.resultList = []
        self.log('startAnalyze')
    
    @override
    def handleItem(self, platform, country, genreId, date, data):
        pass


    @override
    def endAnalyze(self):
        pass

    @override
    def forceWrite(self):
        pass
