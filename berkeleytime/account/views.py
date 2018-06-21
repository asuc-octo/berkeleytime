from django.shortcuts import render_to_response
from django.template import RequestContext
import random
from django.contrib.auth.decorators import login_required


######################################################################################################
###### USER VIEWS ####################################################################################
######################################################################################################

professors = [
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/sahai.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/abbeel.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/elad.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/ayazifar.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/denero.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/hilfinger.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/joshhug.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/rao.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/praghavendra.jpg",
    "https://www2.eecs.berkeley.edu/Faculty/Photos/Homepages/shenker.jpg"
]

default = "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg"
EECS = False

@login_required
def render_profile(request):
    rc = RequestContext(request)
    data = request.user.socialaccount_set.filter(provider='google')[0].extra_data

    rc['NAME'] = data['name'].split(" ")[0].title()
    rc['UNAME'] = data['name'].title()
    if data['picture'] == default and EECS:
        rc['PICTURE'] = random.choice(professors)
    else:
        rc['PICTURE'] = data['picture']
    return render_to_response("account/profile.html", context_instance=rc)