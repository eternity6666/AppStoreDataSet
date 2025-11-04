#-*- coding: utf-8 -*-

from FilePath.FilePathListManager import FilePathListManager
from Analyze.Plugin.Impl.AppInfoPlugin import AppInfoPlugin
from Analyze.AnalyzeHandler import AnalyzeHandler
from Analyze.Plugin.Impl.DeveloperPlugin import DeveloperPlugin
from Analyze.Plugin.Impl.OrderPlugin import OrderPlugin
from Analyze.Plugin.Impl.AppTestPlugin import AppTestPlugin

if __name__ == '__main__':
    analyzeHandler = AnalyzeHandler(FilePathListManager().dataList)
    # analyzeHandler.register(DeveloperPlugin())
    analyzeHandler.register(OrderPlugin())
    analyzeHandler.register(AppInfoPlugin())
    # analyzeHandler.register(AppTestPlugin())
    analyzeHandler.analyze()
