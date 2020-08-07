@echo off
git pull origin master
:: input commit message
::set /p commit_msg=Please input commit message:
:: show git status
:: git status
:: add all changing
git add -A
:: local commit
git commit -m "%date%"
:: push to remote repository
git push origin master
:: make a pause 
pause