import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { H3, P, Button } from 'bt/custom';
import close from 'assets/svg/common/close.svg';

import { connect, ConnectedProps } from 'react-redux'
import { ReduxState } from '../../redux/store'
import { closeLandingModal } from '../../redux/common/actions'

interface Props extends PropsFromRedux {}

class LandingModal extends Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Modal show={this.props.landingModal} onHide={this.props.closeLandingModal} className="landing-modal" dialogClassName={"landing-modal-dialog"}>
        <button className="link-btn back-btn" onClick={this.props.closeLandingModal}>
          <img src={close} />
        </button>
        <img className="landing-modal-img" src={this.props.content["img"]} alt="" />
        <P bold className="mb-2 landing-modal-subtitle">{this.props.content["subtitle"]}</P>
        <H3 bold className="mb-2">{this.props.content["title"]}</H3>
        <P className="landing-modal-text">
        {this.props.content["message"]}
        </P>
        <Button className="landing-modal-btn" href={{ as_link: this.props.content["link"] }}>{this.props.content["button"]}</Button>
      </Modal>
    );
  }

  componentWillUnmount() {
    console.log("UNMOUNTING");
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