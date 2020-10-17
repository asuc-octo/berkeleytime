import React, { FC } from 'react'

const H6: FC<Props> = (props) => {
  let classNames = [props.className ?? '', 'bt-h6']
  
  if (props.bold) {
    classNames.push('bt-bold')
  }

  return (
    <h6 className={classNames.join(' ')}>{props.children}</h6>
  )
}

export interface Props {
  className?: string
  bold?: boolean
}

export default H6