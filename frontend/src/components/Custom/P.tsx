import React, { FC } from 'react'

const P: FC<Props> = (props) => {
  let classNames = [props.className ?? '', 'bt-p']
  
  if (props.bold) {
    classNames.push('bt-bold')
  }

  return (
    <p className={classNames.join(' ')}>{props.children}</p>
  )
}

export interface Props {
  className?: string
  bold?: boolean
}

export default P