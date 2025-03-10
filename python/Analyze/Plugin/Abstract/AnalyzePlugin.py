#-*- coding: utf-8 -*-

from abc import abstractmethod

class AnalyzePlugin:
    def __init__(self):
        self.tag = self.__class__.__name__

    @abstractmethod
    def startAnalyze(self):
        raise Exception('Not implemented')

    @abstractmethod
    def handleItem(self, platform, country, genreId, date, data):
        raise Exception('Not implemented')

    @abstractmethod
    def endAnalyze(self):
        raise Exception('Not implemented')

    @abstractmethod
    def forceWrite(self):
        raise Exception('Not implemented')
