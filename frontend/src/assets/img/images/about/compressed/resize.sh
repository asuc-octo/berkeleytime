#!/bin/bash

for file in ./*.jpg
do
    convert $file -resize 40000@ $file
done
