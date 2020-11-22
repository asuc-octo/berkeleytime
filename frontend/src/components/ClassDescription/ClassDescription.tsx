import React, { CSSProperties, useState } from 'react';
// import Radium from 'radium';
import { BeatLoader } from 'react-spinners';

import people from '../../assets/svg/catalog/people.svg';
import chart from '../../assets/svg/catalog/chart.svg';
import book from '../../assets/svg/catalog/book.svg';
import launch from '../../assets/svg/catalog/launch.svg';

import {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
} from '../../utils/utils';
import { useGetCourseForIdQuery } from '../../graphql/graphql';
import { stableSortPlaylists } from 'utils/playlists/playlist';
import { getLatestSemester, Semester } from 'utils/playlists/semesters';
import SectionTable from './SectionTable';

type ClassDescriptionProps = {
  courseId: string;
  semester?: Semester;
  modifyFilters: (add: Set<string>, remove: Set<string>) => void;
};

const ClassDescription = ({
  courseId,
  semester,
  modifyFilters,
}: ClassDescriptionProps) => {
  const [readMore, setReadMore] = useState<boolean | null>(false);

  const { data, loading, error } = useGetCourseForIdQuery({
    variables: {
      id: courseId,
      year: semester?.year,
      semester: semester?.semester,
    },
  });

  if (!data) {
    return (
      <div className="catalog-description-container">
        {error ? (
          <div className="loading">
            A critical error occured loading the data.
          </div>
        ) : (
          loading && (
            <div className="loading">
              <BeatLoader color="#579EFF" size={15} sizeUnit="px" />
            </div>
          )
        )}
      </div>
    );
  }

  const course = data.course!;
  const playlists = course.playlistSet.edges.map((e) => e?.node!);
  const sections = course.sectionSet.edges.map((e) => e?.node!);

  const latestSemester = getLatestSemester(playlists);
  const semesterUrl =
    latestSemester && `${latestSemester.semester}-${latestSemester.year}`;

  const pills = stableSortPlaylists(playlists, 4);

  const toGrades = {
    pathname: course !== null ? `/grades/0-${course.id}-all-all` : `/grades`,
    state: { course: course },
  };

  // TODO: remove
  const toEnrollment = {
    pathname:
      course !== null && semesterUrl !== null
        ? `/enrollment/0-${course.id}-${semesterUrl}-all`
        : `/enrollment`,
    state: { course: course },
  };

  // This is all 'Read more' logic.
  const charsPerRow = 80;
  const moreOffset = 15;
  let description = course.description;
  let prereqs = '';
  let moreDesc: boolean | null = null;
  let morePrereq: boolean | null = null;

  // No idea how this works, but this is what
  // handles the 'Read More' functionality.
  if (readMore) {
    // expand
    if (course.prerequisites) {
      prereqs = course.prerequisites;
      morePrereq = false;
    } else {
      moreDesc = false;
    }
  } else {
    // collapse
    let descRows = Math.round(course.description.length / charsPerRow);
    if (descRows > 3 || (descRows == 3 && course.prerequisites)) {
      description = description.slice(0, 3 * charsPerRow - moreOffset) + '...';
      moreDesc = true;
    }
    if (descRows < 3 && course.prerequisites) {
      prereqs = course.prerequisites;
      if (descRows >= 1 && prereqs.length > charsPerRow) {
        prereqs = prereqs.slice(0, charsPerRow - moreOffset) + '...';
        morePrereq = true;
      } else if (descRows == 0 && prereqs.length > 2 * charsPerRow) {
        prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + '...';
        morePrereq = true;
      }
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
          <h6>{course.title}</h6>
          <div className="stats">
            <div className="statline">
              <img src={people} />
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
                    target="_blank"
                    className="statlink"
                  >
                    <img src={launch} />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={chart} />
              Average Grade: &nbsp;
              {course.gradeAverage !== -1 ? (
                <div className="statline-div">
                  {applyIndicatorGrade(
                    course.letterAverage,
                    course.letterAverage
                  )}{' '}
                  &nbsp;
                  <a
                    href={toGrades.pathname}
                    target="_blank"
                    className="statlink"
                  >
                    <img src={launch} />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={book} />
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
                <span onClick={() => setReadMore(moreDesc)}>
                  {' '}
                  {moreDesc ? ' See more' : ' See less'}
                </span>
              )}
            </p>
          </section>
        )}
        {prereqs.length > 0 && (
          <section className="prereqs">
            <h6>Prerequisites</h6>
            <p>
              {prereqs}
              {morePrereq != null && (
                <span onClick={() => setReadMore(morePrereq)}>
                  {' '}
                  {morePrereq ? ' See more' : ' See less'}
                </span>
              )}
            </p>
          </section>
        )}
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
              <SectionTable sections={sections} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// ClassDescription = Radium(ClassDescription);
export default ClassDescription;
