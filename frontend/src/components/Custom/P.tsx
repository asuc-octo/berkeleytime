import React, { FC } from 'react'
import TextProps, { getClassNames } from './TextProps'

const P: FC<TextProps> = (props) => {
  return (
    <p className={getClassNames('bt-p', props)}>{props.children}</p>
  )
}

export type { TextProps as Props }
export default P
