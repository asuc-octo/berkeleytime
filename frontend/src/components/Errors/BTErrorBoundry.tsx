import React, { Component } from "react";

type BTErrorBoundryProps = {};
type BTErrorBoundryState = {
  error: Error | null;
};

class BTErrorBoundry extends Component<
  BTErrorBoundryProps,
  BTErrorBoundryState
> {
  constructor(props: BTErrorBoundryProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): BTErrorBoundryState {
    return { error };
  }

  render() {
    // TODO: make more production-friendly
    if (this.state.error !== null) {
      return (
        <div>
          <p>An error occured.</p>
          <pre>
            {this.state.error.message}
            <br />
            {this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BTErrorBoundry;
