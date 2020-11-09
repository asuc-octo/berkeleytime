import React, { PureComponent } from 'react';
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

class Profile extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,  // 0: account, 1: notif, 2: support
    };
  }

  switchTab(index) {
    if (this.state.tabIndex !== index) {
      this.setState({ tabIndex: index });
    }
  }

  render() {
    // console.log(this.props.userProfile)

    let tabIndex = this.state.tabIndex;
    let accountImg = tabIndex == 0 ? accountSelected : account;
    let notifImg = tabIndex == 1 ? notifSelected : notif;
    let supportImg = tabIndex == 2 ? supportSelected : support;

    return (
      <div className="profile-container">
        <Container>
          <Row>
            <Col lg={2}>
              <div id="account" className={tabIndex == 0 ? "selected" : ""} onClick={() => this.switchTab(0)}>
                <img src={accountImg}/>
                <span>Your Account</span>
              </div>
              <div id="notif" className={tabIndex == 1 ? "selected" : ""} onClick={() => this.switchTab(1)}>
                <img src={notifImg}/>
                <span>Notifications</span>
              </div>
              <div id="support" className={tabIndex == 2 ? "selected" : ""} onClick={() => this.switchTab(2)}>
                <img src={supportImg}/>
                <span>Support</span>
              </div>
            </Col>
            <Col lg={10} className="subview-container">
              {tabIndex == 0 ? <AccountSubview/> : tabIndex == 1 ? <NotificationsSubview/> : <SupportSubview/>}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Profile;
