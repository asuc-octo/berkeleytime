import React, { PureComponent, useState } from 'react';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';

import AccountSubview from '../../components/Profile/AccountSubview';
import NotificationsSubview from '../../components/Profile/NotificationsSubview';
import SupportSubview from '../../components/Profile/SupportSubview';

import account from "../../assets/svg/profile/account.svg";
import accountSelected from "../../assets/svg/profile/account_selected.svg";
import notif from "../../assets/svg/profile/notif.svg";
import notifSelected from "../../assets/svg/profile/notif_selected.svg";
import support from "../../assets/svg/profile/support.svg";
import supportSelected from "../../assets/svg/profile/support_selected.svg";
import { useGetUserQuery } from '../../graphql/graphql';
import { BeatLoader } from 'react-spinners';

const Profile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { data, loading, error } = useGetUserQuery();

  function switchTab(index: number) {
    if (tabIndex !== index) {
      setTabIndex(index);
    }
  }

  // console.log(this.props.userProfile)
  const accountImg = tabIndex == 0 ? accountSelected : account;
  const notifImg = tabIndex == 1 ? notifSelected : notif;
  const supportImg = tabIndex == 2 ? supportSelected : support;

  return (
    <div className="profile-container">
      <Container>
        <Row>
          <Col lg={2}>
            <div id="account" className={tabIndex == 0 ? "selected" : ""} onClick={() => switchTab(0)}>
              <img src={accountImg}/>
              <span>Your Account</span>
            </div>
            <div id="notif" className={tabIndex == 1 ? "selected" : ""} onClick={() => switchTab(1)}>
              <img src={notifImg}/>
              <span>Notifications</span>
            </div>
            <div id="support" className={tabIndex == 2 ? "selected" : ""} onClick={() => switchTab(2)}>
              <img src={supportImg}/>
              <span>Support</span>
            </div>
          </Col>
          <Col lg={10} className="subview-container">
            {loading ? (
              <BeatLoader
                color="#579EFF"
                size={15}
                sizeUnit="px"
              />
            ) : (
              tabIndex === 0 ? <AccountSubview userProfile={data?.user!}/> :
              tabIndex === 1 ? <NotificationsSubview/> :
              <SupportSubview/>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Profile;
