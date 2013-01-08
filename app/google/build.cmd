@echo off
set chrome=%AppData%\..\Local\Google\Chrome\Application\chrome.exe
cd src
..\7za a -r ..\piu-piu.zip *.*
cd ..
del piu-piu.crx 
%chrome% --pack-extension="C:\Users\Michael\Google Drive\piu-piu\extensions\chrome\src"
copy /y src.crx piu-piu.crx
copy /y src.pem ..\..\..\piu-piu.pem
del src.pem
del src.crx
pause