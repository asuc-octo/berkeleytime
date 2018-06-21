import datetime, re

def partial_match(features, keywords):
    """
    returns the feature in features (a list of keywords) that is fuzzily matched by
    elements in the string keywords, based on the following examples:

    features = ["Dwinelle Hall", "Dwinelle Hall Annex"]
    keywords = ["Dwinelle", "Hall"]
    >>> partial_match(features, keywords)
    "Dwinelle Hall"

    if __any__ keyword in keywords does not appear in an element in features, the element
    in features is immediately disqualified from being matched

    keywords = ["Evans", "Hall"]
    >>> partial_match(features, keywords)
    None (matching_indices returns empty set for "Evans", and the score for
    each feature is reduced to None)

    keywords = ["Hall"]
    >>> partial_match(features, keywords)
    None (queries with a single keyword and multiple results return None)

    """
    features_table = {(name, index, len(name.split(" "))): 0 for index, name in enumerate(features)}
    features_keywords = [name.split(" ") for name in features]
    for keyword in keywords:
        keyword_matches = matching_indices(features_keywords, keyword)
        for key in features_table.keys():
            name, index, weight = key
            round_score = 1 if index in keyword_matches else None
            update_feature(features_table, key, round_score)
    table = features_table.items()
    # retrieve feature with the maximum score
    key, score = max(table, key=lambda x: x[1])
    count = features_table.values().count(score)
    if not score:
        return "no results"
    elif count > 3:
        return "too many results"
    elif (count > 1 and len(keywords) == 1):
        tied_keys = [k for k, v in table if v == score]
        return [name for name, index, weight in tied_keys]
    return [key[0]]

def update_feature(features_table, key, round_score):
    if round_score == None:
        features_table[key] = None
    elif (features_table[key] != None and round_score):
        name, index, weight = key
        features_table[key] += round_score/float(weight)

def matching_indices(keyword_arr, target):
    """
    returns a set of indices of keyword_arr, a list of list of keywords, which contains
    target as an element in each respective list of keywords

    """
    matches = []
    for index, keywords in enumerate(keyword_arr):
        if target in keywords:
            matches.append(index)
    return set(matches)

def parse_digits(string):
    """
    returns True if string contains a number, False otherwise

    """
    return re.findall(r"[0-9]+", string)
