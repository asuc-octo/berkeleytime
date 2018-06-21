import os
import yaml


class ConfigDict:
    def __init__(self, mapper):
        self.mapper = mapper

    def get(self, target):
        current = self.mapper
        for key in target.split("."):
            current = current[key]
        return current

    @property
    def department_to_abbreviation_mapper(self):
        return _dept_to_abbreviation

    @property
    def abbreviation_to_department_mapper(self):
        return _abbreviation_to_dept

    def normalized_abbreviation(self, abbreviation):
        if abbreviation in _abbreviation_to_dept.iterkeys():
            return abbreviation
        return _dept_to_abbreviation.get(abbreviation)

basepath = os.path.dirname(__file__)
config_path = os.path.abspath(os.path.join(basepath, "config/base.yaml"))
print "Loading base configs from %s" % config_path
with open(config_path) as f:
    # invert the YAML file and create abbreviation: department_name mapping
    config = ConfigDict(yaml.safe_load(f))

abbreviation_path = os.path.abspath(
    os.path.join(basepath, "config/abbreviation.yaml"))
print "Loading base configs from %s" % abbreviation_path
with open(abbreviation_path) as f:
    # invert the YAML file and create abbreviation: department_name mapping
    _map = yaml.safe_load(f)
    _abbreviation_to_dept = {k: v[0] for k, v in _map.items()}
    _dept_to_abbreviation = {v.upper(): k for k in _map.keys() for v in _map[k]}  # noqa
    # print _dept_to_abbreviation

def _check_abbreviation_yaml_file(filename):  # noqa
    """Ensure YAML file does not contain duplicate keys."""
    department_names, duplicates = set(), []
    with open(filename) as f:
        for line in f.readlines():
            line = line.strip()
            if line and line != "\n":
                if line in department_names:
                    duplicates.append(line)
                    continue
                department_names.add(line)

    assert duplicates == [], "%s contains duplicate keys: %s" % (filename, duplicates)  # noqa

_check_abbreviation_yaml_file(abbreviation_path)
