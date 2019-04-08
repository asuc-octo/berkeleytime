import React from 'react';

class Modal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		  modalState: false
		};

		this.toggleModal = this.toggleModal.bind(this);
	}
  
	componentDidMount(){
	  let visited = localStorage["alreadyVisited"];
	  if(visited) {
	    this.setState({ modalState: true });
	  } else {
	    localStorage["alreadyVisited"] = true;
	    this.setState({ modalState: true});
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
		    <div className="modal-background" onClick={this.toggleModal}></div>
		    <div className="modal-content">

				<p>&#128059;</p>
				<br></br>

				<h1><b>Hello from the BerkeleyTime team!</b></h1>
				<br></br>
				
				<p>It’s here! We’re proud and excited to present a new design of BerkeleyTime. The BT team has been hard at work over the last few semesters to make BerkeleyTime the very best experience for students like you.  We’re a small team of students that volunteer our time and efforts to maintain, update, and improve the site. Feel free to look around, report any bugs, and give us feedback!</p>
				<br></br>
				
				<p>We’d love to hear from you.</p>
				<p>&#128155; &#128153; Cheers, the BerkeleyTime team</p>
				<br></br>
			    </div>

		    <button className="modal-close is-large" aria-label="close" onClick={this.toggleModal}></button>
		</div>
		);
	}
}

export default Modal;
