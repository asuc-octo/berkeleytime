import unittest
from validators import *


class ValidatorTest(unittest.TestCase):

    def _assert_error(self, validator, input):
        self.assertRaises(ValidationError, validator.validate, input)

    def _assert_validates(self, validator, input):
        self.assertTrue(validator.validate(input))

    def _assert_produces_message(self, validator):
        try:
            validator.validate('')
        except ValidationError as v:
            self.assertIsNotNone(v)
            self.assertIsNotNone(str(v))

    def test_required_validator(self):
        req = RequiredValidator('myval')

        self._assert_error(req, '')
        self._assert_error(req, None)

        self._assert_produces_message(req)

        self._assert_validates(req, "hello")

    def test_email_validator(self):
        validator = EmailValidator(True)

        self._assert_error(validator, 'hjlkdsa')
        self._assert_error(validator, '')
        self._assert_error(validator, 'hjlksda@')
        self._assert_error(validator, 'hjlksda@hhjklas')
        self._assert_error(validator, 'hjlksda@hhjklas.')
        self._assert_error(validator, 'hjlksda@hhjklas.com')
        self._assert_error(validator, '@berkeley.edu')

        self._assert_validates(validator, 'noah.gilmore@berkeley.edu')
        self._assert_validates(validator, 'noah.gilmore@inst.eecs.berkeley.edu')

        self._assert_produces_message(validator)

    def test_one_of_validator(self):
        validator = OneOfValidator(['fall', 'spring', 'summer'])

        self._assert_error(validator, 'hjkldsa')
        self._assert_error(validator, '')
        self._assert_error(validator, 'Fall')

        self._assert_validates(validator, 'fall')
        self._assert_validates(validator, 'spring')
        self._assert_validates(validator, 'summer')

        self._assert_produces_message(validator)

    def test_int_validator(self):
        validator = NonnegativeIntegerValidator(True)
        self._assert_error(validator, "-123")
        self._assert_error(validator, "hjlksadf")
        self._assert_error(validator, "")
        self._assert_error(validator, None)

        self._assert_validates(validator, "1234")
        self._assert_validates(validator, "0")
        self._assert_validates(validator, "23152")
        self._assert_validates(validator, "1")

        self._assert_produces_message(validator)

    def test_full_validation(self):
        self.assertEqual("noah.gilmore@berkeley.edu", validate("noah.gilmore@berkeley.edu", email=True, required=True))
        self.assertEqual("My Awesome Schedule", validate("My Awesome Schedule", required=True))
        self.assertEqual("fall", validate("fall", required=True, one_of=['fall', 'spring']))
        self.assertEqual("2013", validate("2013", required=True, integer=True))

        self.assertEqual("My Awesome Schedule&lt;h1&gt;", validate("My Awesome Schedule<h1>", required=True, escape=True))

if __name__ == '__main__':
    unittest.main()