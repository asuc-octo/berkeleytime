import React, { useState } from 'react';

import Property from './Property';
import ProfileCard from './ProfileCard';
import EditPencil from '../../assets/svg/profile/edit.svg';
import {
  CourseOverviewFragment,
  UserProfileFragment,
} from '../../graphql/graphql';

import MAJORS from './majors.json';
import { useUpdateUser } from '../../graphql/hooks/user';
import { useUnsaveCourse } from '../../graphql/hooks/saveCourse';
import { compareDepartmentName } from 'utils/courses/sorting';
import { Button } from 'react-bootstrap';
import Subview from './Subview';
import { Link } from 'react-router-dom';

type Props = {
  userProfile: UserProfileFragment;
};

// Show this many cards before adding a 'show more'
const MAX_PROFILE_CARDS = 6;

const AccountSubview = ({ userProfile }: Props) => {
  const [removable, setRemovable] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);

  const updateUser = useUpdateUser();

  //Information has been hardcoded for testing purposes only
  const majorOptions = MAJORS.map((major) => ({
    label: major,
    value: major,
  }));

  const user = userProfile.user;
  const savedClasses = (userProfile.savedClasses || [])
    .filter((c): c is CourseOverviewFragment => c !== null)
    .sort(compareDepartmentName);

  return (
    <div className="account-view">
      <Subview title="Personal Information">
        <Property
          options={majorOptions}
          attribute="Full Name"
          value={`${user.firstName} ${user.lastName}`}
        />
        <Property
          options={majorOptions}
          attribute="bConnected Email"
          value={user.email}
        />
        <Property
          options={majorOptions}
          attribute="Major(s)"
          major={userProfile.major}
          updateMajor={({ value }: { value: string }) =>
            updateUser(userProfile, {
              major: value,
            })
          }
        />
      </Subview>

      <Subview
        title="Saved Classes"
        widget={
          savedClasses.length > 0 && (
            <button
              className="edit-button"
              onClick={() => setRemovable((v) => !v)}
            >
              <img
                className="edit-pencil"
                src={EditPencil}
                alt="Edit Classes"
              />
            </button>
          )
        }
      >
        {
          savedClasses.length > 0 ? (
            <div className="profile-card-grid">
              {(showAll
                ? savedClasses
                : savedClasses.slice(0, MAX_PROFILE_CARDS)
              ).map((course) => (
                <ProfileCard
                  removable={removable}
                  key={course.id}
                  course={course}
                  remove={useUnsaveCourse}
                  link={`/catalog/${course.abbreviation}/${course.courseNumber}`}
                />
              ))}
            </div>
          ) : (
            <div className="bt-light-text"> Click on the bookmark icons in <Link to="/catalog"> Catalog </Link> to start saving classes! </div>
          )
        }

        {savedClasses.length > MAX_PROFILE_CARDS && (
          <Button
            onClick={() => setShowAll((v) => !v)}
            variant="link"
            className="profile-see-more px-0"
          >
            {showAll ? 'Show fewer classes' : 'See all classes'}
          </Button>
        )}
      </Subview>
    </div>
  );
};

export default AccountSubview;
