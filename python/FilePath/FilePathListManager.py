#-*- coding: utf-8 -*-

import os

class FilePathListManager:
    def __init__(self):
        filePathList = {}
        FilePathListManager.getFilePathList('iphone', filePathList)
        FilePathListManager.getFilePathList('ipad', filePathList)
        self.dataList = FilePathListManager.sortList(filePathList)

    def getFilePathList(dictPath, filePathList):
        for root, _, files in os.walk(dictPath):
            for file in files:
                path = os.path.join(root, file)
                if not path.endswith('.json'):
                    continue
                date = path.split('/')[2]
                filePathList[date] = filePathList.get(date, []) + [path]

    def sortList(filePathList):
        result = []
        for date in sorted(filePathList.keys()):
            result.append({
                'date': date,
                'list': filePathList[date]
            })
        return result
