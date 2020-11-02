from django.http import HttpResponse
import json


def render_to_json(obj):
    return HttpResponse(json.dumps(obj, default=str), content_type='application/json')

def render_to_empty_json():
    return render_to_json({})

def render_to_empty_json_with_status_code(status):
    return HttpResponse(json.dumps({}, default=str), content_type="application/json", status=status)