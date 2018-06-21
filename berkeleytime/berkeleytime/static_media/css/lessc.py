#!usr/bin/python
import os
import sys

name = sys.argv[1]
os.system("lessc " + name + ".less " + name + ".css")
