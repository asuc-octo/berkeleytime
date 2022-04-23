import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { H3, P, Button } from 'bt/custom';
import close from 'assets/svg/common/close.svg';

export class LandingModal extends Component {
  render() {
    return (
      <Modal show={this.props.showModal} onHide={this.props.hideModal} className="modal" dialogClassName={"landing-modal-dialog"}>
        <button className="link-btn back-btn" onClick={this.props.hideModal}>
          <img src={close} />
        </button>
        <img className="modal-img" src={this.props.content["img"]} alt="" />
        <P bold className="mb-2 modal-subtitle">{this.props.content["subtitle"]}</P>
        <H3 bold className="mb-2">{this.props.content["title"]}</H3>
        <P className="modal-text">
        {this.props.content["message"]}
        </P>
        <Button className="modal-btn" href={{ as_link: this.props.content["link"] }}>{this.props.content["button"]}</Button>
      </Modal>
    );
  }
}

export default LandingModal;
