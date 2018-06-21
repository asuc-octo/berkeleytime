from account.utils import generic_info
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR, STATIC_URL, ONGOING_SEMESTER, ONGOING_YEAR, TELEBEARS_ALREADY_STARTED
from berkeleytime.settings import DOMAIN_NAME
from berkeleytime.settings import IS_PRODUCTION
from berkeleytime.utils.requests import get_profile

def facebook_info(request):
    url = STATIC_URL + "css/img/user_photos/CAMPANILE.jpg"
    try:
        if request.user.is_authenticated():
            profile = get_profile(request)
            if profile.facebook_id is not None:
                url = "http://graph.facebook.com/" + str(profile.facebook_id) + "/picture?type=large"
                return {"NAME": profile.facebook_name, "PROFILE_PICTURE": url, "HAS_FACEBOOK": True}
            return {"NAME": request.user.username, "PROFILE_PICTURE": url, "HAS_FACEBOOK": False}
        return {"NAME": "berkeleytime", "PROFILE_PICTURE": url, "HAS_FACEBOOK": False}
    except Exception as e:
        print e
        return {"NAME": "berkeleytime", "PROFILE_PICTURE": url, "HAS_FACEBOOK": False}

def semester_info(request):
    return {"CURRENT_SEMESTER": CURRENT_SEMESTER, "CURRENT_YEAR": CURRENT_YEAR,
    "ONGOING_SEMESTER": ONGOING_SEMESTER, "ONGOING_YEAR": ONGOING_YEAR, "TELEBEARS_ALREADY_STARTED": TELEBEARS_ALREADY_STARTED}

def domain_name(request):
    return {"DOMAIN_NAME": DOMAIN_NAME}

def is_production(request):
    return {"IS_PRODUCTION": IS_PRODUCTION}
