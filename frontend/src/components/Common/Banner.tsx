import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { Button } from 'bt/custom'

import { ReduxState } from '../../redux/store'
import { closeBanner } from '../../redux/common/actions'

import close from '../../assets/svg/common/close.svg'

interface Props extends PropsFromRedux {}

const Banner: FC<Props> = (props) => {
  const text = 'We\'ve updated our site with Spring 2021 courses 📚';

  return props.banner ? (
    <div className="banner">
      <div className="content">
        <p>{text}</p>
        <Button size="sm" href={{as_link: "/catalog"}}>Go to catalog</Button>
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

