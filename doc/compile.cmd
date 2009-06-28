cd tmp\
del /Q /S /F *
cd ..\

xcopy fig tmp\fig\
xcopy cls tmp\cls\

xcopy *.bst tmp\
xcopy *.tex tmp\
xcopy *.cls tmp\
xcopy *.bib tmp\
xcopy Makefile tmp\

cd tmp\
make

"C:\progs\Foxit Reader\Foxit Reader.exe" projekt.pdf

cd ..\
