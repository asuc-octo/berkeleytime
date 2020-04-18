import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import { closeBanner } from '../../redux/actions';
import close from '../../assets/svg/common/close.svg';

class Banner extends PureComponent {
  render() {
    const { visible, dispatch } = this.props;
    const text = 'We have a new announcement! Here is a longer description of the main text and more details about the whole thing.';

    return visible ? (
      <div className="banner">
        <div className="content">
          <p>{ text }</p>
          <Button variant="bt-primary-inverted" size="sm">Learn More</Button>
        </div>
        <img src={close} onClick={() => dispatch(closeBanner())}/>
      </div>
    ) : null;
  }
}

Banner.propTypes = {
  visible: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { banner } = state.banner;
  return {
    visible: banner,
  };
};

export default connect(mapStateToProps)(Banner);
