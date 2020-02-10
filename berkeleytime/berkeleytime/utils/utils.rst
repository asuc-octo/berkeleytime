Utils
*************

.. toctree::
   :caption: Contents:


common.py
##################


corsmiddleware.py
##################
.. autoclass:: berkeleytime.utils.corsmiddleware.CORSMiddleware
   :members:


requests.py
##################
.. autofunction:: berkeleytime.utils.requests.success_json
.. autofunction:: berkeleytime.utils.requests.failure_json
.. autofunction:: berkeleytime.utils.requests.get_profile
.. autofunction:: berkeleytime.utils.requests.render_to_json
.. autofunction:: berkeleytime.utils.requests.render_to_empty_json
.. autofunction:: berkeleytime.utils.requests.render_to_empty_json_with_status_code
.. autofunction:: berkeleytime.utils.requests.render_error_to_json
.. autofunction:: berkeleytime.utils.requests.raise_404_on_error
.. autofunction:: berkeleytime.utils.requests.raise_404_if_not_get


tests.py
##################
.. autoclass:: berkeleytime.utils.tests.ValidatorTest
   :members:


validators.py
##################
.. autoclass:: berkeleytime.utils.validators.ValidationError
   :members:

.. autoclass:: berkeleytime.utils.validators.AbstractValidator
   :members:

.. autoclass:: berkeleytime.utils.validators.RequiredValidator
   :members:

.. autoclass:: berkeleytime.utils.validators.EmailValidator
   :members:

.. autoclass:: berkeleytime.utils.validators.OneOfValidator
   :members:

.. autoclass:: berkeleytime.utils.validators.NonnegativeIntegerValidator
   :members:

.. autofunction:: berkeleytime.utils.validators.validate_on_key_value
.. autofunction:: berkeleytime.utils.validators.validate
