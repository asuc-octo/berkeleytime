import requests

from utils import get_config_dict, send_message


def create_formatted_message(response):
    config = get_config_dict(response["Config"])

    question_mapping = {}
    for count, question in enumerate(config["questions"], 1):
        question_mapping[question["title"]] = "Question " + str(count)

    items = []
    for question in config["questions"]:
        if question_mapping[question["title"]] in response:
            items.append("<strong>{}</strong>\n{}".format(question["title"], response[question_mapping[question["title"]]]))

    return "\n\n".join(items)


def auto_github_issue(response, hook_config):
    """
    This hook posts a github issue after a response is received. It titles the issue with
    either hook_config["title"] or the response submitted to the question hook_config["question"].
    """
    ghToken = "***REMOVED***"
    ghURL = "https://api.github.com/repos/asuc-octo/berkeleytime/issues?access_token="

    payload = {
        "title": response[hook_config["question"]] if hook_config["question"] in response else hook_config["title"],
        "body": create_formatted_message(response)
    }

    requests.post(ghURL+ghToken, json=payload)


def auto_email(response, hook_config):
    """
    This hook sends an email to one or a list of people whenever a response is filled out.
    NOT COMPLETE. DO NOT USE.
    """
    send_message(hook_config["to"], hook_config["subject"], create_formatted_message(response))


def auto_confirm(response, hook_config):
    """
    This hook sends an email to the responder. It uses the email located at the question
    hook_config["question"].
    NOT COMPLETE. DO NOT USE.
    """
    to = response[hook_config["question"]]
    send_message(to, hook_config["subject"], create_formatted_message(response))


HOOKS = [auto_github_issue, auto_email, auto_confirm]

HOOKS_MAP = {f.__name__ : f for f in HOOKS}


def dispatch_hooks(response):
    """
    For a given response, looks up and triggers all hooks associated with that form.
    """
    config = get_config_dict(response["Config"])
    if "hooks" not in config["info"]:
        return

    for hook_config in config["info"]["hooks"]:
        if hook_config["name"] in HOOKS_MAP:
            HOOKS_MAP[hook_config["name"]](response, hook_config)
        else:
            print("No hook with the name {} found. Available hooks: {}".format(hook_config["name"], HOOKS_MAP.keys()))


