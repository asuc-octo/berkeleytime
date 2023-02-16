import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from 'bt/custom';
import close from 'assets/svg/common/close.svg';
import schedulerImg from '../../assets/img/landing/scheduler.png';

import { connect, ConnectedProps } from 'react-redux'
import { ReduxState } from '../../redux/store'
import { closeLandingModal } from '../../redux/common/actions'

interface Props extends PropsFromRedux {}

const modal_info = { subtitle: 'NEW!', title: 'Berkeleytime Scheduler', 
message: 'Try out our new scheduler feature to build your ideal schedule!', 
button: 'Explore Scheduler', link: '/scheduler', img: schedulerImg };

class LandingModal extends Component<Props> {

  render() {
    return (
      <Modal show={this.props.landingModal} onHide={this.props.closeLandingModal} className="landing-modal" dialogClassName={"landing-modal-dialog"}>
        <button className="landing-close-btn" onClick={this.props.closeLandingModal}>
          <img src={close} alt="close" />
        </button>
        <img className="landing-modal-img" src={modal_info["img"]} alt="" />
        <p className="bt-p mb-2 landing-modal-subtitle">{modal_info["subtitle"]}</p>
        <h3 className="bt-h3 bt-bold mb-2">{modal_info["title"]}</h3>
        <p className="bt-p landing-modal-text">
        {modal_info["message"]}
        </p>
        <Button className="landing-modal-btn" href={{ as_link: modal_info["link"] }}>{modal_info["button"]}</Button>
      </Modal>
    );
  }

  componentWillUnmount() {
    this.props.closeLandingModal();
  }
}

const mapState = (state: ReduxState) => ({
  landingModal: state.common.landingModal
})

const mapDispatch = {
  closeLandingModal
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(LandingModal)