import React, { ComponentType, ReactNode, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import AccountSubview from '../../components/Profile/AccountSubview';
import NotificationsSubview from '../../components/Profile/NotificationsSubview';
import SupportSubview from '../../components/Profile/SupportSubview';

import { ReactComponent as Account } from '../../assets/svg/profile/account.svg';
import { ReactComponent as AccountSelected } from '../../assets/svg/profile/account_selected.svg';
import { ReactComponent as Notif } from '../../assets/svg/profile/notif.svg';
import { ReactComponent as NotifSelected } from '../../assets/svg/profile/notif_selected.svg';
import { ReactComponent as Support } from '../../assets/svg/profile/support.svg';
import { ReactComponent as SupportSelected } from '../../assets/svg/profile/support_selected.svg';
import { UserProfileFragment } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import { useUser } from '../../graphql/hooks/user';
import { Redirect } from 'react-router-dom';

const tabs: {
  key: string;
  label: string;
  selectedImage: ReactNode;
  deselectedImage: ReactNode;
  component:
    | ComponentType<{ userProfile: UserProfileFragment }>
    | ComponentType;
}[] = [
  {
    key: 'account',
    label: 'Your Account',
    selectedImage: <AccountSelected />,
    deselectedImage: <Account />,
    component: AccountSubview,
  },
  {
    key: 'notif',
    label: 'Notifications',
    selectedImage: <NotifSelected />,
    deselectedImage: <Notif />,
    component: NotificationsSubview,
  },
  {
    key: 'support',
    label: 'Support',
    selectedImage: <SupportSelected />,
    deselectedImage: <Support />,
    component: SupportSubview,
  },
];

const Profile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { isLoggedIn, user, loading } = useUser();

  const TabComponent = tabs[tabIndex].component;

  // If we're not logged in, redirect.
  if (!loading && !isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <div className="viewport-app">
      <Container className="profile-container col-lg-6 cold-md-6 col-12 offset-lg-3 offset-md-3">
        <h1>{tabs[tabIndex].label}</h1>
        <div className="profile-view-container">
          <div className="profile-sidebar">
            {tabs.map((tab, index) => (
              <Button
                variant="link"
                key={tab.key}
                className={tabIndex === index ? 'selected' : ''}
                onClick={() => setTabIndex(index)}
              >
                {tabIndex === index ? tab.selectedImage : tab.deselectedImage}
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
          <div className="profile-view">
            {!user ? <BTLoader /> : <TabComponent userProfile={user} />}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Profile;
