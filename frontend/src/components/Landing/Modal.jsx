import React from 'react';
import { Link } from 'react-router-dom';

class Modal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		  modalState: false
		};

		this.toggleModal = this.toggleModal.bind(this);
	}

	componentDidMount(){
	  let visited = sessionStorage["alreadyVisited"];
	  if(visited) {
	    this.setState({ modalState: false });
	  } else {
	    sessionStorage["alreadyVisited"] = true;
	    this.setState({ modalState: true});
	  }

	  this.setState({ modalState: false});
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
		    <div className="modal-background" onClick={this.toggleModal}></div>
		    <div className="modal-content">

				<p className="modal-icon">&#128059;</p>

				<h1 className="modal-cta">Hey Bears! We're Hiring!</h1>

				<p className="modal-body">
					BerkeleyTime is currently hiring for the Fall 2019 semester! We're looking for 
					passionate frontend developers, backend developers, and designers to join us in
					making course discovery here at Berkeley as simple as can be. 
					We'd love to see you apply to join our team!
				</p>
				
				<Link to="/apply" className="button inverted">Apply</Link>
				<br></br>
			    </div>

		    <button className="modal-close is-large" aria-label="close" onClick={this.toggleModal}></button>
		</div>
		);
	}
}

export default Modal;
