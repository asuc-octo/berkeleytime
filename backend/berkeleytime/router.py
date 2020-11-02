from rest_framework import routers
from user import urls as userUrls

# build list of lists of endpoints from apps
routeLists = [
    userUrls.routeList
]

router = routers.DefaultRouter()
for routeList in routeLists:
    for route in routeList:
        if len(route) == 3:  # has base name
            router.register(route[0], route[1], basename=route[2])
        else:
            router.register(route[0], route[1])
