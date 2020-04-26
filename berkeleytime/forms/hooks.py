from googleapi import CACHED_CONFIGS
import json
import requests

ghToken = "***REMOVED***"
ghURL = "https://api.github.com/repos/asuc-octo/berkeleytime/issues?access_token="


def auto_issue(response):
    config = CACHED_CONFIGS[response["Config"]]

    question_mapping = {}
    for count, question in enumerate(config["questions"], 1):
        question_mapping[question["title"]] = "Question " + str(count)

    items = []
    for question in config["questions"]:
        if question_mapping[question["title"]] in response:
            items.append("<strong>{}</strong>\n{}".format(question["title"], response[question_mapping[question["title"]]]))

    payload = {
        "title": response["Question 2"],
        "body": "\n\n".join(items)
    }

    requests.post(ghURL+ghToken, json=payload)

