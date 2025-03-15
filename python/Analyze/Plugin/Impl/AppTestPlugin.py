# -*- coding: utf-8 -*-

from typing import override
from Analyze.Plugin.Abstract.AnalyzePlugin import AnalyzePlugin
from Utils.Utils import logI

class AppTestPlugin(AnalyzePlugin):
    def __init__(self):
        super().__init__()
        self.anaylzeData = {}
        self.filedChangeAnalyzePath = 'simple/test/filedChangeAnalyze.csv'

    @override
    def startAnalyze(self):
        if not os.path.exists(self.filedChangeAnalyzePath):
            os.makedirs(self.filePath)
        logI('startAnalyze')


    @override
    def handleItem(self, platform, country, genreId, date, data):
        pass
            

    @override
    def endAnalyze(self):
        pass

    @override
    def forceWrite(self):
        pass

