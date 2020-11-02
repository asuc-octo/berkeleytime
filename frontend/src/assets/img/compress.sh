#!/bin/bash

# jpg compression tool
# ex: ./compress.sh silly.jpg 25%

magick $1 -strip -interlace Plane -gaussian-blur 0.05 -quality $2 $1.compressed.jpg
