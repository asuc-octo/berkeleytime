import React, { FC } from 'react'
import TextProps, { getClassNames } from './TextProps'

const H6: FC<TextProps> = (props) => {
  return (
    <h6 className={getClassNames('bt-h6', props)}>{props.children}</h6>
  )
}

export type { TextProps as Props }
export default H6
