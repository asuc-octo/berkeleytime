import os

def parse(filename, separator, threshold, phrase):
    """
    Method for getting the subject & course numbers from a pdf of breadth classes. 
    Takes in the filename of the pdf, separator for the output csv, new word threshold when parsing, 
    and a list of phrases to delete from the output file.
    Outputs a csv with the same basename and location as the input pdf.
    Takes ~10 seconds to output all 7 CSVs.
    """
    basename, file_extension = os.path.splitext(filename)
    pdf_to_csv(basename, separator, threshold)
    cleanup_csv(basename + ".csv", phrase)


# Method code from http://stackoverflow.com/a/36935858 with some minor edits for use with BerkeleyTime
def pdf_to_csv(basename, separator, threshold):
    from cStringIO import StringIO
    from pdfminer.converter import LTChar, TextConverter
    from pdfminer.layout import LAParams
    from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
    from pdfminer.pdfpage import PDFPage

    class CsvConverter(TextConverter):
        def __init__(self, *args, **kwargs):
            TextConverter.__init__(self, *args, **kwargs)
            self.separator = separator
            self.threshold = threshold

        def end_page(self, i):
            from collections import defaultdict
            lines = defaultdict(lambda: {})
            for child in self.cur_item._objs:
                if isinstance(child, LTChar):
                    (_, _, x, y) = child.bbox
                    line = lines[int(-y)]
                    line[x] = child._text.encode(self.codec)
            for y in sorted(lines.keys()):
                line = lines[y]
                self.line_creator(line)
                self.outfp.write(self.line_creator(line))
                self.outfp.write("\n")

        def line_creator(self, line):
            keys = sorted(line.keys())
            # calculate the average distange between each character on this row
            average_distance = sum([keys[i] - keys[i - 1] for i in range(1, len(keys))]) / len(keys)
            # append the first character to the result
            result = [line[keys[0]]]
            fields = 0; # we only want subject + course number, this counts how many fields have been written
            for i in range(1, len(keys)):
                # if the distance between this character and the last character is greater than the average*threshold  
                if (keys[i] - keys[i - 1]) > average_distance * self.threshold: 
                    # we break before the second semicolon can be written
                    if (fields == 1):
                        break
                    
                    # append the separator into that position
                    result.append(self.separator)
                    fields += 1

                # append the character
                result.append(line[keys[i]])
            printable_line = ''.join(result)
            return printable_line

    # ... the following part of the code is a remix of the
    # convert() function in the pdfminer/tools/pdf2text module
    rsrc = PDFResourceManager()
    
    
    outfp = open(basename + '.csv', 'w')

    device = CsvConverter(rsrc, outfp, codec="utf-8", laparams=LAParams())
    # becuase my test documents are utf-8 (note: utf-8 is the default codec)

    fp = open(basename + '.pdf', 'rb')

    interpreter = PDFPageInterpreter(rsrc, device)
    for i, page in enumerate(PDFPage.get_pages(fp)):
        if page is not None:
            interpreter.process_page(page)
    device.close()
    outfp.close()
    fp.close()


# Removes the first two lines of the pdf in addition to all the "Spring 2017 Arts and Literature" headers
def cleanup_csv(filename, phrases):
    f = open(filename, 'r')
    text = f.readlines()
    f.close()

    f = open(filename, 'w')
    line_num = 0
    for line in text:
        if any(word in line for word in phrases):
            continue
        else:
            f.write(line)     
    f.close()



if __name__ == '__main__':
    # the separator to use with the CSV
    separator = ','
    # the distance multiplier after which a character is considered part of a new word/column/block.
    # I had to play with this threshold a bit, 2 seems to work right now. This is probably the number that will differentiate semester to semester.
    threshold = 2
    phrases = ('Spring', 'Subject') # lines will be removed from output file if a word in phrases is in the line
    location = 'spring2017breadth/' # location of the pdf

    parse(location + 'spring2017breadthartsliterature.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthbiologicalscience.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthhistoricalstudies.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthinternationalstudies.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthphilosophyvalues.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthphysicalscience.pdf', separator, threshold, phrases)
    parse(location + 'spring2017breadthsocialbehavioralsciences.pdf', separator, threshold, phrases)

