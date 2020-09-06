import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';

import { P, Button } from 'bt/custom'

import { closeBanner } from '../../redux/actions';
import close from '../../assets/svg/common/close.svg';

interface Props extends ReduxProps {}

const Banner: FC<Props> = (props) => {
  const text = 'We are hiring for the 2020-21 school year! ✨';

  console.log(props.banner)

  return props.banner ? (
    <div className="banner">
      <div className="content">
        <p>{text}</p>
        <Button size="sm" link_to="/apply">Apply</Button>
      </div>
      <img src={close} alt="close" onClick={props.closeBanner} />
    </div>
  ) : null;
}

interface ReduxState {
  banner: {
    banner: boolean
  }
}

const mapState = (state: ReduxState) => ({
  banner: state.banner.banner
})

const mapDispatch = {
  closeBanner
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

export default connector(Banner)

