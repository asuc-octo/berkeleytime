from django import template
register = template.Library()

def full_name(user):
    s = user.socialaccount_set.filter(provider='google')
    if len(s) == 0:
        return "Berkeleytime"
    return s[0].extra_data['name']

def first_name(user):
    return full_name(user).split(" ")[0]

register.filter('first_name', first_name)
register.filter('full_name', full_name)

