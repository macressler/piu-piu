#!/bin/sh

cd "`dirname "$0"`"
cd src
../7za
../7za a ../piu-piu.zip *.* _locales -x!*/.DS_Store
