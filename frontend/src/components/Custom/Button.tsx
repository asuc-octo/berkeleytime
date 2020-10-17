import React, { FC } from 'react'
import { Button as BootstrapButton } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Button: FC<Props> = (props) => {
  if (typeof props.href === 'object') {
    return (
      <BootstrapButton
        className={props.className}
        bsPrefix='bt-btn'
        variant={props.variant ?? 'primary'}
        size={props.size}
        as={Link}
        to={props.href.as_link}
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
        size={props.size}
        href={props.href}
      >
        {props.children}
      </BootstrapButton>
    )
  }
}

export interface Props {
  className?: string
  variant?: 'primary' | 'inverted'
  size?: 'sm'
  href?: string | { as_link: string }
}

export default Button