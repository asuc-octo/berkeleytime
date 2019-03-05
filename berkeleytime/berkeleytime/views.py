from django.shortcuts import render_to_response
from django.template import RequestContext
from settings import PROJECT_ROOT
import yaml, os

members_path = os.path.join(PROJECT_ROOT, 'berkeleytime/templates/team/members.yaml')

with open(members_path, 'r') as stream:
    member_data = yaml.load(stream)
member_data['past'] = sorted(member_data['past'], key=lambda x: x['name'])

def test(request):
    return render_to_response("qunit_tests.html", {}, context_instance=RequestContext(request))

def about_page(request):
    rc = RequestContext(request)
    rc["members"] = member_data
    return render_to_response("team/about.html", context_instance=rc)

def home_page(request):
    rc = RequestContext(request)
    rc["banner"] = False
    return render_to_response("about.html", context_instance=rc)
