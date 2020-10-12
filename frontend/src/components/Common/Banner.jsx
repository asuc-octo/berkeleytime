import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { closeBanner } from '../../redux/actions';
import close from '../../assets/svg/common/close.svg';

class Banner extends PureComponent {
  render() {
    const { visible, dispatch } = this.props;
    const text = "We've updated our site with Spring 2021 courses 📚";

    return visible ? (
      <div className="banner">
        <div className="content">
          <p>{ text }</p>
          <Button variant="bt-primary-inverted" size="sm" as={Link} to="/catalog">Go to catalog</Button>
        </div>
        <img src={close} alt="close" onClick={() => dispatch(closeBanner())} />
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
