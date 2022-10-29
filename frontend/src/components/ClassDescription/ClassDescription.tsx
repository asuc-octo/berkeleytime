import React, { useEffect, useState } from 'react';

import people from '../../assets/svg/catalog/people.svg';
import chart from '../../assets/svg/catalog/chart.svg';
import book from '../../assets/svg/catalog/book.svg';
import launch from '../../assets/svg/catalog/launch.svg';
import link from '../../assets/svg/catalog/link.svg';

import {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
} from '../../utils/utils';
import { useGetCourseForNameQuery } from '../../graphql/graphql';
import { stableSortPlaylists } from 'utils/playlists/playlist';
import { getLatestSemester, Semester } from 'utils/playlists/semesters';
import { sortSections } from 'utils/sections/sort';
import SectionTable from './SectionTable';
import BTLoader from 'components/Common/BTLoader';
import { CourseReference, courseToName } from 'utils/courses/course';
import { fetchEnrollContext } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';

type Props = {
  course: CourseReference;
  semester?: Semester;
  modifyFilters: (add: Set<string>, remove: Set<string>) => void;
};

const ClassDescription = ({
  course: courseRef,
  semester,
  modifyFilters,
}: Props) => {
  // Hack to work with REST-style enrollment/grades
  const dispatch = useDispatch();

  type RESTCourseInfo = {
    id: number;
    abbreviation: string;
    course_number: string;
  };

  const enrollmentContext: RESTCourseInfo[] | undefined = useSelector(
    (state) => (state as any).enrollment.context.courses
  );

  const oldCourseId = enrollmentContext?.find(
    (c) =>
      c.course_number === courseRef.courseNumber &&
      c.abbreviation === courseRef.abbreviation
  )?.id;

  useEffect(() => {
    dispatch(fetchEnrollContext());
  }, [dispatch]);

  // End hack

  const [readMore, setReadMore] = useState<boolean | null>(false);

  const { data, loading, error } = useGetCourseForNameQuery({
    variables: {
      abbreviation: courseRef.abbreviation,
      courseNumber: courseRef.courseNumber,
      year: semester?.year,
      semester: semester?.semester,
    },
  });

  var dict = new Map([
    ['Field Work', 'FLD'],
    ['Session', 'SES'],
    ['Colloquium', 'COL'],
    ['Recitation', 'REC'],
    ['Internship', 'INT'],
    ['Studio', 'STD'],
    ['Demonstration', 'dem'],
    ['Web-based Discussion', 'WBD'],
    ['Discussion', 'DIS'],
    ['Tutorial', 'TUT'],
    ['Clinic', 'CLN'],
    ['Independent Study', 'IND'],
    ['Self-paced', 'SLF'],
    ['Seminar', 'SEM'],
    ['Lecture', 'LEC'],
    ['Web-based Lecture', 'WBL'],
    ['Web-Based Lecture', 'WBL'],
    ['Directed Group Study', 'GRP'],
    ['Laboratory', 'LAB'],
  ]);

  if (!data) {
    return (
      <div className="catalog-description-container">
        {error ? (
          <div className="loading">
            A critical error occured loading the data.
          </div>
        ) : (
          loading && <BTLoader fill />
        )}
      </div>
    );
  }

  const course = data.allCourses?.edges[0]?.node;

  if (!course) {
    return (
      <div className="catalog-description-container">
        <div className="loading">
          <div className="catalog-results-empty">
            Unknown course {courseToName(courseRef)}
          </div>
        </div>
      </div>
    );
  }

  const playlists = course.playlistSet.edges.map((e) => e?.node!);

  let sections = course.sectionSet.edges.map((e) => e?.node!);
  sections = sortSections(sections);
  var stre = '';
  if (semester != null && sections.length > 0) {
    var punctuation = ',';
    var regex = new RegExp('[' + punctuation + ']', 'g');
    var rmc = courseRef.abbreviation.replace(regex, '');
    stre = `https://classes.berkeley.edu/content/${semester.year}
    -${semester.semester}
    -${rmc}
    -${courseRef.courseNumber}
    -${sections[0].sectionNumber}
    -${dict.get(sections[0].kind)}
    -${sections[0].sectionNumber}`;
    stre = stre.replace(/\s+/g, '');
  }

  const latestSemester = getLatestSemester(playlists);
  const semesterUrl = latestSemester && `${latestSemester.semester}-${latestSemester.year}`;
  const pills = stableSortPlaylists(playlists, 4);

  const toGrades = {
    pathname:
      course !== null && oldCourseId
        ? `/grades/0-${oldCourseId}-all-all`
        : `/grades`,
    state: { course: course },
  };

  // TODO: remove
  const toEnrollment = {
    pathname:
      course !== null && semesterUrl !== null && oldCourseId
        ? `/enrollment/0-${oldCourseId}-${semesterUrl}-all`
        : `/enrollment`,
    state: { course: course },
  };

  const checkOverridePrereqs = (prereqs: string) => {
    // Spring 2020 override from fultonb@berkeley.edu
    // if (courseToName(course) === 'PB HLTH 126') {
    //   prereqs =
    //     'No prerequisites. This field was modified as requested by the instructor.';
    // }
    // Fall 2021 override from brutger@berkeley.edu
    if (courseToName(course) === 'POL SCI 126A') {
      prereqs =
        'No prerequisites. This field was modified as requested by the instructor.';
    }
    return prereqs;
  };

  // This is all 'Read more' logic.
  const charsPerRow = 80;
  const moreOffset = 15;
  let description = course.description;
  let prereqs = '';
  let moreDesc: boolean | null = null;
  let morePrereq: boolean | null = null;
  let moreInfo: any = <></>;

  // No idea how this works, but this is what
  // handles the 'Read More' functionality.
  if (readMore) {
    // expand
    if (course.prerequisites) {
      prereqs = checkOverridePrereqs(course.prerequisites);
      morePrereq = false;
    } else {
      moreDesc = false;
    }
    moreInfo = (
      <div className="toCatalog">
        {stre.length > 0 ? (
          <p className="prereqs">
            For more details, please checkout the
            <a href={stre} target="_blank" rel="noreferrer">
              &nbsp;Berkeley Academic Guide&nbsp;
              <img src={launch} alt="" />
            </a>
          </p>
        ) : (
          <></>
        )}
        {readMore == true && (
          <span onClick={() => setReadMore(!readMore)}> {' See less'}</span>
        )}
      </div>
    );
  } else {
    // collapse
    let descRows = Math.round(course.description.length / charsPerRow);
    if (descRows > 3 || (descRows === 3 && course.prerequisites)) {
      description = description.slice(0, 3 * charsPerRow - moreOffset) + '...';
      moreInfo = <></>;
      moreDesc = true;
    }
    if (descRows < 3 && course.prerequisites) {
      prereqs = checkOverridePrereqs(course.prerequisites);
      if (descRows >= 1 && prereqs.length > charsPerRow) {
        prereqs = prereqs.slice(0, charsPerRow - moreOffset) + '...';
        morePrereq = true;
      } else if (descRows === 0 && prereqs.length > 2 * charsPerRow) {
        prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + '...';
        morePrereq = true;
      }
    }
    moreInfo = <></>;
    if (!moreDesc) {
      moreInfo = (
        <div className="toCatalog">
          {stre.length > 0 ? (
            <p className="prereqs">
              For more details, please checkout the
              <a href={stre} target="_blank" rel="noreferrer">
                &nbsp;Berkeley Academic Guide
                <img className="statlink" src={launch} alt="" />
              </a>
            </p>
          ) : (
            <></>
          )}
        </div>
      );
    }
  }

  // Render the contents of the catalog
  return (
    <div className="catalog-description-container">
      <div className="catalog-description">
        <section>
          <h3>
            {course.abbreviation} {course.courseNumber}
          </h3>
          <div className="title">
            <h6>{course.title}&nbsp;</h6>
            {stre.length > 0 ? (
              <a
                href={stre}
                target="_blank"
                rel="noreferrer"
                className="statlink"
              >
                <img src={link} alt="" />
              </a>
            ) : (
              <></>
            )}
          </div>
          <div className="stats">
            <div className="statline">
              <img src={people} alt="" />
              Enrolled: &nbsp;
              {course.enrolled !== -1 ? (
                <div className="statline-div">
                  {applyIndicatorPercent(
                    `${course.enrolled}/${course.enrolledMax}`,
                    course.enrolledPercentage
                  )}
                  &nbsp;
                  <a
                    href={toEnrollment.pathname}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                    rel="noreferrer"
                    className="statlink"
                  >
                    <img src={launch} alt="" />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={chart} alt="" />
              Average Grade: &nbsp;
              {course.gradeAverage !== -1 ? (
                <div
                  className="statline-div"
                  title={
                    course.gradeAverage
                      ? `Avg Grade: ${(course.gradeAverage * 25).toFixed(1)}%`
                      : undefined
                  }
                >
                  {applyIndicatorGrade(
                    course.letterAverage,
                    course.letterAverage
                  )}{' '}
                  &nbsp;
                  <a
                    href={toGrades.pathname}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                    rel="noreferrer"
                    className="statlink"
                  >
                    <img src={launch} alt="" />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={book} alt="" />
              {formatUnits(course.units)}
            </div>
          </div>
        </section>
        <section className="pill-container description-section">
          <div>
            {pills.map((req) => (
              <div
                className="pill"
                key={req.id}
                onClick={() => modifyFilters(new Set([req.id]), new Set())}
              >
                {req.name}
              </div>
            ))}
          </div>
        </section>
        {description.length > 0 && (
          <section>
            <p className="description">
              {description}
              {moreDesc != null && (
                <span onClick={() => setReadMore(!readMore)}>
                  {' '}
                  {moreDesc ? ' See more' : ''}
                </span>
              )}
            </p>
          </section>
        )}
        {prereqs.length > 0 && (
          <section className="prereqs">
            <h6>Prerequisites</h6>
            <p>{prereqs}</p>
          </section>
        )}
        {moreInfo}
        <section>
          <h5>Class Times</h5>
        </section>
        <section className="table-container description-section">
          <div>
            {sections.length === 0 ? (
              <div className="table-empty">
                This class has no sections for the selected semester.
              </div>
            ) : (
              <>
                <SectionTable sections={sections} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClassDescription;
