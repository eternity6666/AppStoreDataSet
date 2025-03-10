#-*- coding: utf-8 -*-

from FilePath.FilePathListManager import FilePathListManager
from Analyze.AnalyzeHandler import AnalyzeHandler
from Analyze.Plugin.Impl.DeveloperPlugin import DeveloperPlugin
from Analyze.Plugin.Impl.OrderPlugin import OrderPlugin

if __name__ == '__main__':
    analyzeHandler = AnalyzeHandler(FilePathListManager().dataList)
    analyzeHandler.register(DeveloperPlugin())
    analyzeHandler.register(OrderPlugin())
    analyzeHandler.analyze()