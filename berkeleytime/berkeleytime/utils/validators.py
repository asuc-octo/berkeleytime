from cgi import escape
import re

class ValidationError(Exception):
    '''ValidationError will be thrown when a string does not validate.'''
    pass


class AbstractValidator(object):
    '''Should have the following fields:
    regex: the regular expression to check the input against
    key: a string to denote this validator (e.g. 'email')
    message: a message to be displayed on error

    Should implement the following methods:
    validate: throws ValidationError if validation does not succeed
    get_message: get the error message to de displayed on failure
    '''

    message = "An invalid value was detected."

    def __init__(self, _):
        pass

    @classmethod
    def get_validator_dict(cls):
        return dict((c.key, c) for c in cls.__subclasses__())

    def validate(self, value):
        if value is None:
            self.raise_error()
        if self.regex.search(value) is not None:
            return True
        self.raise_error()

    def get_message(self):
        return self.message

    def raise_error(self):
        raise ValidationError(self.get_message())


class RequiredValidator(AbstractValidator):
    '''The provided value should have a not none value.'''
    key = 'required'

    def __init__(self, name):
        self.name = name

    def validate(self, value):
        if value is not None and value != '':
            return True
        self.raise_error()

    def get_message(self):
        if self.name is not None:
            return "The following fields are required: " + self.name
        else:
            return "It seems you're missing a required field."


class EmailValidator(AbstractValidator):
    '''The provided value should be a berkeley.edu email address.'''
    key = 'email'
    regex = re.compile(r'^.+@.*berkeley\.edu$')
    message = "Please enter a valid berkeley.edu email address."


class OneOfValidator(AbstractValidator):
    '''The provided value should be one of those in a given list.'''
    key = 'one_of'

    def __init__(self, lst):
        self.acceptable_values = lst

    def validate(self, value):
        if value in self.acceptable_values:
            return True
        self.raise_error()


class NonnegativeIntegerValidator(AbstractValidator):
    key = 'integer'
    regex = re.compile(r'^\d+$')


def validate_on_key_value(key, value, to_validate):
    validator = AbstractValidator.get_validator_dict().get(key)(value)
    validator.validate(to_validate)


def validate(value, **kwargs):
    '''Validate the input based on specified parameters.'''
    rtn = value
    for k, v in kwargs.iteritems():
        if k == 'escape':
            rtn = escape(value)
        else:
            validate_on_key_value(k, v, value)

    return rtn

