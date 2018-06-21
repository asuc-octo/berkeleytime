import iotools, parsetools, time
from geopy.geocoders.googlev3 import GoogleV3

def main():
    pass

def get_rooms():
    """
    assuming it returns dictionary, of department list of courses
    20 BARROWS : 75 seats

    """
    rtn = {}
    current_building = ""
    for line in iotools.read("room"):
        if line.strip():
            if ":" in line:
                # tuple of room_number, seats
                r = parsetools.extract_digits(line)
                if len(r) == 2:
                    rtn[current_building].append({"name": r[0], "seats": r[1]})
                else:
                    print "FORMATTING ERROR: " + str(line.strip())
            else:
                current_building = line.strip()
                rtn[current_building] = []
    return rtn

def get_buildings():
    try:
        custom_places = {
            'Off Campus': (None, None), 'Kerr Field': (None, None), 'California Hall': (37.871959,-122.260339),
            'Gilman Hall': (37.872683, -122.256272), 'Minor Hall Addition': (37.871436,-122.25502),
            'Life Sciences Building Addition': (37.871368,-122.263241), 'South Annex': (None, None),
            'Dwinelle Hall Annex': (37.871148,-122.260929), 'Valley Life Sciences Building': (37.871606,-122.261696),
            'Richmond Field Station 112': (37.9153639, -122.334685), 'Pauley Ballroom': (37.869315,-122.259647),
            'Plant and Microbial Biology Greenhouse': (37.875715, -122.267085),
            "Genetic and Plant Biology Building": (37.873473, -122.264803),
            'Unit I Slottman': (37.867494, -122.255169), 'Unit I Christian': (37.868129, -122.254922),
            'Leconte Hall': (37.872686, -122.257424),
        }
        rtn = []
        g = GoogleV3()
        for line in iotools.read("building"):
            if line:
                if line.startswith("//"):
                    continue
                temp = line.split("--")
                google_name = temp[0].strip() if len(temp) == 2 else temp[2].strip()
                if google_name in custom_places:
                    lat, lng = custom_places[google_name]
                else:
                    place_tuple = g.geocode(google_name + ", Berkeley, CA", exactly_one=False)
                    if type(place_tuple) == list:
                        place_tuple = place_tuple[0]
                    place, (lat, lng) = place_tuple
                    print google_name + ': %s: %.5f, %.5f' % (place, lat, lng)
                    if place.startswith('Berkeley'):
                        print 'GEOLOCATION WARNING: Coordinates may be incorrect: ' + google_name + ': %s: %.5f, %.5f' % (place, lat, lng)
                    time.sleep(.25)
                rtn.append({
                    "name": temp[0].strip(" \n"), "abbreviation": temp[1].strip(" \n"),
                    "latitude": lat, "longitude": lng
                })
        return rtn
    except Exception as e:
        print e

def get_custom_rooms():
    return {
        "REC SPRT FAC": [
            ("Squash Courts", "SQUASH CTS"),
            ("Spieker Aquatics Complex", "SPIEKER POOL"),
            ("Racquetball Courts", "RAQBALL CTS"),
            ("Handball Courts", "HANDBALL CTS"),
            ("Field House", "RSF FLDHOUSE")
        ],
        "HEARST GYM": [
            ("Hearst East Pool", "HEARST EPOOL"),
            ("Hearst Pool", "HEARST POOL"),
            ("Hearst Gym Tennis Courts", "HEARSTGYMCTS")
        ],
        "BECHTEL": [
            ("Sibley Auditorium", "BECHTEL AUD")
        ],
        "WHEELER": [
            ("Wheeler Auditorium", "WHEELER AUD")
        ]
    }

if __name__ == '__main__':
    main()
