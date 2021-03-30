import React, { FC } from 'react'
import TextProps, { getClassNames } from './TextProps'

const H5: FC<TextProps> = (props) => {
  return (
    <h5 className={getClassNames('bt-h5', props)}>{props.children}</h5>
  )
}

export type { TextProps as Props }
export default H5