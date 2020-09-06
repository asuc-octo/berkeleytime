import React, { FC } from 'react'
import { Button as BootstrapButton } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Button: FC<Props> = (props) => {
  if (props.link_to) {
    return (
      <BootstrapButton
        className={props.className}
        bsPrefix='bt-btn'
        variant={props.variant ?? 'primary'}
        as={Link}
        to={props.link_to}
      >
        {props.children}
      </BootstrapButton>
    )
  } else {
    return (
      <BootstrapButton
        className={props.className}
        bsPrefix='bt-btn'
        variant={props.variant ?? 'primary'}
      >
        {props.children}
      </BootstrapButton>
    )
  }

  
}

export interface Props {
  className?: string
  variant?: 'primary' | 'inverted'
  link_to?: string
}

export default Button