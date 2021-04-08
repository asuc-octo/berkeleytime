import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Button } from 'bt/custom'
import { A } from 'bt/custom'

import { ReduxState } from '../../redux/store'
import { closeBanner } from '../../redux/common/actions'

import close from '../../assets/svg/common/close.svg'

interface Props extends PropsFromRedux {}

const Banner: FC<Props> = (props) => {
  const text = <p> 🗳️ <b>Voting for <a className="link" onClick={() => onNavigate("https://asuc.org/elections/")}><b>ASUC elections</b></a> ends at 1AM.</b> Learn about the <A className="bt-indicator-red link" href={{ as_link: "/stf-guide" }}><b>Student Tech Fund.</b></A></p>;

  return props.banner ? (
    <div className="banner">
      <div className="content">
        {text}
        <A className="btn-bt-dark-mode" href={{ as_link: "/i-voted" }}><b>I VOTED</b></A>
        <a className="btn-bt-patriotic" onClick={() => onNavigate("https://callink.berkeley.edu/submitter/election/start/477985")}><b>VOTE</b></a>
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

