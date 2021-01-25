import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Button } from 'bt/custom'

import { ReduxState } from '../../redux/store'
import { closeBanner } from '../../redux/common/actions'

import close from '../../assets/svg/common/close.svg'

interface Props extends PropsFromRedux {}

const Banner: FC<Props> = (props) => {
  const text = <p>✨ <b>Login</b> to start saving classes and getting Berkeleytime notifications ✨</p>;

  return props.banner ? (
    <div className="banner">
      <div className="content">
        {text}
        <Button size="sm" href={{as_link: "/releases"}}>Learn More</Button>
      </div>
      <img src={close} alt="close" onClick={props.closeBanner} />
    </div>
  ) : null;
}

const mapState = (state: ReduxState) => ({
  banner: state.common.banner
})

const mapDispatch = {
  closeBanner
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(Banner)

