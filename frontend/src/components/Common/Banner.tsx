import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Button } from 'bt/custom'
import { A } from 'bt/custom'

import { ReduxState } from '../../redux/store'
import { closeBanner } from '../../redux/common/actions'

import close from '../../assets/svg/common/close.svg'

interface Props extends PropsFromRedux {}

const Banner: FC<Props> = (props) => {
  const text = <p> 👩‍💻 💖 Sign up for <A className="link" href={{as_link: "/civhacks"}}><b>CivHacks</b></A>, a hackathon for social good from April 23rd-25th </p>;

  return props.banner ? (
    <div className="banner">
      <div className="content">
        {text}
        <Button size="sm" href={{as_link: "/releases"}}>Register</Button>
      </div>
      <img src={close} alt="close" onClick={props.closeBanner} />
    </div>
  ) : null;
}

const onNavigate = (url: string) => {
    window.open(url, '_blank');
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

