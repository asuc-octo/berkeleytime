import React, { FC } from 'react'
import TextProps, { getClassNames } from './TextProps'

const H3: FC<TextProps> = (props) => {
  return (
    <h3 className={getClassNames('bt-h3', props)}>{props.children}</h3>
  )
}

export type { TextProps as Props }
export default H3
