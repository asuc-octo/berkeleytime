import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import TextProps, { getClassNames } from './TextProps'

const A: FC<Props> = (props) => {
  if (typeof props.href === 'object') {
    return (
      <Link to={props.href.as_link} className={getClassNames('bt-a', props)}>
        {props.children}
      </Link>
    )
  } else {
    return (
      <a href={props.href} className={getClassNames('bt-a', props)}>
        {props.children}
      </a>
    )
  }
}

export interface Props extends TextProps {
  href?: string | { as_link: string }
}

export default A
