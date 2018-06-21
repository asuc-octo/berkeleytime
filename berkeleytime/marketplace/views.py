"""View methods for marketplace."""
from catalog.service.section import section_service
from marketplace.service.promotion import promotion_service


def _get_textbook_context(course_id, semester, year):
    """Get all textbooks corresponding for a single semester.

    :param int course_id:
    :param str semester:
    :param str year:
    :returns [
        {
            display_text: Spring 2017 (Denero),
            textbooks: list<entity.Textbook>,
        }
    ]
    """
    primary_sections = section_service.find_by_course_id(
        course_id, semester, year, is_primary=True
    )

    textbook_context_by_section = []
    # TODO (ASUC) This can definitely be done in a single query
    for ps in primary_sections:
        textbooks = section_service.find_textbooks_by_section_id(ps.id)
        if not textbooks:
            continue

        text = '%s %s (%s)' % (ps.kind, ps.section_number, ps.instructor)
        textbook_context_by_section.append({
            'display_text': text,
            'textbooks': textbooks,
        })

    return textbook_context_by_section


def _get_recommended_textbook_context(textbook_context_by_section):
    """Return a single recommended textbook.

    :param list<list<entity.Textbook>> textbooks_by_section:
        List of list of textbooks grouped by section
    :returns <entity.Textbook>

    Find a textbook that is listed for every section, return the max $
    """
    id_to_textbook, textbook_ids_by_section = {}, []

    # We can only put primitives into a set, so we create a map id --> textbook
    for context_for_section in textbook_context_by_section:
        textbooks = context_for_section['textbooks']
        for t in textbooks:
            id_to_textbook[t.id] = t
        textbook_ids_by_section.append(set([t.id for t in textbooks]))  # noqa

    common_textbook_ids = list(set.intersection(*textbook_ids_by_section))
    # Filter out textbooks that you cannot buy
    common_textbook_ids = [
        id for id in common_textbook_ids if (id_to_textbook[id].amazon_affiliate_url)  # noqa
    ]
    common_textbook_ids.sort(key=lambda id: id_to_textbook[id].amazon_price, reverse=True)  # noqa

    if common_textbook_ids:
        return id_to_textbook[common_textbook_ids[0]]


def get_textbook_context(course_id, semester, year):
    """Retrieve textbooks for the current semester, year for course.

    :returns {
        recommended_textbook: {
            <entity.Textbook>
        }
        textbook_context_by_section: {
            Lecture 001 (Denero): [<entity.Textbook>]
        }
    }
    """
    recommended_display_text = 'Recommended for %s %s' % (semester.title(), year.title())  # noqa
    display_text = 'Textbooks for %s %s' % (semester.title(), year.title())
    textbook_context_by_section = _get_textbook_context(course_id, semester, year)  # noqa

    # No textbooks found, either because no textbooks or not updated yet
    if not textbook_context_by_section:
        # TODO (*) Hard-coded for now
        recommended_display_text = 'Recommended from Fall 2017'
        display_text = 'Textbooks from Fall 2017'
        textbook_context_by_section = _get_textbook_context(course_id, 'fall', '2017')  # noqa

    # Textbooks found for some sections this year
    if textbook_context_by_section:
        return {
            'recommended_textbook': {
                'display_text': recommended_display_text,
                'textbook': _get_recommended_textbook_context(textbook_context_by_section)  # noqa
            },
            'display_text': display_text,
            'textbook_context_by_section': textbook_context_by_section,
        }
    return {}


def get_promotion_context():
    """Return a list of promotions ranked by importance."""
    try:
        return [p.to_primitive() for p in promotion_service.find()]
    # TODO (Yuxin) Do proper error handling here
    except Exception:
        return []
