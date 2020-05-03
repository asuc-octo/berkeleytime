from django.shortcuts import render_to_response
from django.template import RequestContext
from settings import PROJECT_ROOT
import os
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper

members_path = os.path.join(PROJECT_ROOT, 'berkeleytime/templates/team/members.yaml')

with open(members_path, 'r') as stream:
    member_data = load(stream, Loader=Loader)
member_data['past'] = sorted(member_data['past'], key=lambda x: x['name'])

def test(request):
    return render_to_response("qunit_tests.html", {}, context_instance=RequestContext(request))

def about_page(request):
    rc = RequestContext(request)
    rc["members"] = member_data
    return render_to_response("team/about.html", context_instance=rc)

def home_page(request):
    rc = RequestContext(request)
    rc["banner"] = True
    return render_to_response("about.html", context_instance=rc)
