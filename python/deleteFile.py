#-*- coding: utf-8 -*-

import os

def deleteFile(path, targetPath):
    # 删除 path 下面的所有路径含有 targetPath 的文件，并清理空文件夹
    for root, dirs, files in os.walk(path, topdown=False):
        for file in files:
            file_path = os.path.join(root, file)
            if targetPath in file_path:
                try:
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
        
        # 清理空文件夹
        for dir in dirs:
            dir_path = os.path.join(root, dir)
            try:
                if not os.listdir(dir_path):  # 如果文件夹为空
                    os.rmdir(dir_path)
                    print(f"Removed empty directory: {dir_path}")
            except Exception as e:
                print(f"Error removing directory {dir_path}: {e}")

if __name__ == '__main__':
    dictPathList = ['ipad', 'iphone']
    needRemoveDataList = ['2025-02']
    for dictPath in dictPathList:
        for targetPath in needRemoveDataList:
            deleteFile(dictPath, targetPath)

