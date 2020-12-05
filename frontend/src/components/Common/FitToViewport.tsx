import React, { FC } from 'react'

interface Props {
  underNavbar?: boolean
}

const FitToViewport: FC<Props> = (props) => {
  const className = 'fit-to-viewport' + (
    props.underNavbar ? ' under-navbar' : ''
  )

  return (
    <div className={className}>
      { props.children }
    </div>
  )
}

export default FitToViewport
