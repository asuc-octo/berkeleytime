Catalog
*************

.. toctree::
   :caption: Contents:

   haste/haste.rst
   job/job.rst
   service/service.rst


admin.py
##################
This registers these models at /admin.


models.py
##################

.. autoclass:: catalog.models.Course
   :members:

.. autoclass:: catalog.models.Section
   :members:

.. autoclass:: catalog.models.Enrollment
   :members:

.. autoclass:: catalog.models.Grade
   :members:

.. autoclass:: catalog.models.Playlist
   :members:

.. autoclass:: catalog.models.UpdateLog
   :members:


utils.py
##################

.. autofunction:: catalog.utils.is_post
.. autofunction:: catalog.utils.is_get
.. autofunction:: catalog.utils.first_error
.. autofunction:: catalog.utils.sort_course_dicts
.. autofunction:: catalog.utils.extract_suffix
.. autofunction:: catalog.utils.extract_prefix
.. autofunction:: catalog.utils.extract_numeric_component
.. autofunction:: catalog.utils.calculate_letter_average
.. autofunction:: catalog.utils.calculate_numeric_average
.. autofunction:: catalog.utils.calculate_averages


views.py
##################

.. autofunction:: catalog.views.test
.. autofunction:: catalog.views.catalog
.. autofunction:: catalog.views.catalog_context
.. autofunction:: catalog.views.filter
.. autofunction:: catalog.views.courses_to_json
.. autofunction:: catalog.views.union_by_category
.. autofunction:: catalog.views.course
.. autofunction:: catalog.views.course_json
.. autofunction:: catalog.views.get_last_enrollment_update
.. autofunction:: catalog.views.course_box
.. autofunction:: catalog.views.course_box_json
.. autofunction:: catalog.views.cover_photo
.. autofunction:: catalog.views.favorite
.. autofunction:: catalog.views.which_requirements
.. autofunction:: catalog.views.semester_to_value
