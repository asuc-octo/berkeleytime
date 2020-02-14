import React from 'react';
import { Link } from 'react-router-dom';

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalState: false,
    };

    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    const visited = localStorage['spring2020'];
    if (visited) {
      this.setState({ modalState: false });
    } else {
      localStorage['spring2020'] = true;
      this.setState({ modalState: true });
    }
  }

  toggleModal() {
    this.setState((prev, props) => {
      const newState = !prev.modalState;

      return { modalState: newState };
    });
  }

  render() {
    if (!this.state.modalState) {
      return null;
    }
    return (
      <div className="modal is-active">
        <div className="modal-background" onClick={this.toggleModal} />
        <div className="modal-content">
          <p className="modal-icon">&#128059;</p>
          <h1 className="modal-cta" style={{marginBottom: 20}}>Spring 2020 classes have been added to the catalog!</h1>
          <Link to="/catalog" className="button inverted">Search for classes!</Link>
          <br />
        </div>
      </div>
    );
  }
}

export default Modal;
