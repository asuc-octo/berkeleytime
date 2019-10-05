import React, { Component } from 'react';

class SortDropdownMenu extends Component {
  constructor(props, context) {
    super(props, context);
  }

  clickHandler = e => {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    return (
      <button>asdf</button>
    )
  }
}

export default SortDropdownMenu;
