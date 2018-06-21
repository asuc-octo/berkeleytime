#!/usr/bin/env python
import csv, sys

SPECIAL_CHARACTER_ABBREVIATIONS = {
    "ENVDES": "ENV DES",
    "VISSTD": "VIS STD",
    "BIOENG": "BIO ENG",
    "CHMENG": "CHM ENG",
    "CYPLAN": "CY PLAN",
    "CIVENG": "CIV ENG",
    "COMLIT": "COM LIT",
    "DESINV": "DES INV",
    "EALANG": "EA LANG",
    "ELENG": "EL ENG",
    "ENERES": "ENE,RES",
    "ETHSTD": "ETH STD",
    "DEVSTD": "DEV STD",
    "MESTU": "M E STU",
    "INDENG": "IND ENG",
    "LS": "L & S",
    "LDARCH": "LD ARCH",
    "MATSCI": "MAT SCI",
    "MECENG": "MEC ENG",
    "MILAFF": "MIL AFF",
    "MILSCI": "MIL SCI",
    "NAVSCI": "NAV SCI",
    "NESTD": "NE STD",
    "NUCENG": "NUC ENG",
    "PHYSED": "PHYS ED",
    "POLSCI": "POL SCI",
    "PBHLTH": "PB HLTH",
    "PUBPOL": "PUB POL",
    "SOCWEL": "SOC WEL",
    "HINURD": "HIN-URD",
    "MALAYI": "MALAY/I",
    "SASIAN": "S ASIAN",
    "SSEASN": "S,SEASN",
    "COGSCI": "COG SCI",
    "VISSCI": "VIS SCI",
}

def _normalize_abbreviation(abbreviation):
    """Return the abbreviation with special characters (if it has them)"""
    return SPECIAL_CHARACTER_ABBREVIATIONS.get(abbreviation, abbreviation)

def clean_grade_csv(csv_file):
    """
    Takes in CSV and cleans it to expected format below

    Course Subject Cd,Course Number,Section Nbr,Instr Name Concat,A+,A,A-,B+,B,B-,C+,C,C-,D+,D,D-,F,Pass,Satisfactory,Not Pass,Unsatisfactory,Incomplete
    """
    with open('raw/' + csv_file, 'rU') as dirty_csv, open("clean_" + csv_file, 'w') as clean_csv:
        num_lines_read = 0
        num_lines_written = 0
        grade_csv = csv.reader(dirty_csv)
        for line in grade_csv:
            num_lines_read += 1

            clean_line = []

            #CHANGE THE INDICES BELOW IF CSV IS DIFFERENT
            #Abbreviation/Course Subject Cd

            abbreviation = _normalize_abbreviation(line[2])
            # Abbreviations involving commas
            if len(abbreviation.split(',')) > 1:
                clean_line.append('"' + abbreviation + '"')
            else:
                clean_line.append(abbreviation)
            #Course Number
            clean_line.append(line[4])
            #Section Nbr
            clean_line.append(line[5])
            #Instr Name Concat: First Last: John Denero
            clean_line.append(line[7])
            #A+, A, A-,......, F, Pass, Satisfactory, Not Pass, Unsatisfactory, Incomplete
            clean_line += line[9:27]

            print(clean_line)
            clean_line = ",".join(clean_line)
            clean_csv.write(clean_line + "\n")

            num_lines_written += 1

    print("Read " + str(num_lines_read) + " lines, wrote " + str(num_lines_written) + " lines")

if len(sys.argv) != 2:
    print("Must pass in grade csv file: 'semester_year.csv")
else:
    clean_grade_csv(sys.argv[1])