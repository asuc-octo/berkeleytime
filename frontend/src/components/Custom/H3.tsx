import React, { FC } from 'react'

const H3: FC<Props> = (props) => {
  let classNames = [props.className ?? '', 'bt-h3']
  
  if (props.bold) {
    classNames.push('bt-bold')
  }

  return (
    <h3 className={classNames.join(' ')}>{props.children}</h3>
  )
}

export interface Props {
  className?: string
  bold?: boolean
}

export default H3