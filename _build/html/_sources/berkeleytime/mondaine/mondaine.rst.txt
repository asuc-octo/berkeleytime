Mondaine
*************

.. toctree::
   :caption: Contents:

   define/defined
   lib/lib
   service/service


Lib
===============
exceptions.py
###############
.. autoclass:: mondaine.lib.exceptions.MondaineException
   :members:

.. autoclass:: mondaine.lib.exceptions.DefinitionException
   :members:

.. autoclass:: mondaine.lib.exceptions.ResourceException
   :members:


formulas.py
###############
.. autofunction:: mondaine.lib.formulas.gte_n_units
.. autofunction:: mondaine.lib.formulas.exactly_n_units
.. autofunction:: mondaine.lib.formulas.course_id_in
.. autofunction:: mondaine.lib.formulas.course_in
.. autofunction:: mondaine.lib.formulas.course_not_in
.. autofunction:: mondaine.lib.formulas.abbreviation_in
.. autofunction:: mondaine.lib.formulas.course_integer_in
.. autofunction:: mondaine.lib.formulas.course_integer_not_in
.. autofunction:: mondaine.lib.formulas.course_integer_lte_n
.. autofunction:: mondaine.lib.formulas.not_in_definitions
.. autofunction:: mondaine.lib.formulas.not_in_abbreviations

utils.py
###############
.. autofunction:: mondaine.lib.utils.clean
.. autofunction:: mondaine.lib.utils.mandatory
.. autofunction:: mondaine.lib.utils.optional
.. autofunction:: mondaine.lib.utils.is_course_number
.. autofunction:: mondaine.lib.utils.is_float
.. autofunction:: mondaine.lib.utils.department_to_abbreviation
.. autofunction:: mondaine.lib.utils.abbreviation_to_department
.. autofunction:: mondaine.lib.utils.is_abbreviation
.. autofunction:: mondaine.lib.utils.is_department
.. autofunction:: mondaine.lib.utils.translate


Service
===============
department.py
###############
.. autoclass:: mondaine.service.department.DepartmentService
   :members:

engineering.py
###############
.. autoclass:: mondaine.service.engineering.EngineeringService
   :members:

haas.py
###############
.. autoclass:: mondaine.service.haas.HaasService
   :members:

level.py
###############
.. autoclass:: mondaine.service.level.LevelService
   :members:

ls.py
###############
.. autoclass:: mondaine.service.ls.LSService
   :members:

playlist.py
###############
.. autoclass:: mondaine.service.playlist.PlaylistService
   :members:

reading.py
###############
.. autoclass:: mondaine.service.reading.ReadingService
   :members:

semester.py
###############
.. autoclass:: mondaine.service.semester.SemesterService
   :members:

units.py
###############
.. autoclass:: mondaine.service.units.UnitService
   :members:

university.py
###############
.. autoclass:: mondaine.service.university.UniversityService
   :members:
