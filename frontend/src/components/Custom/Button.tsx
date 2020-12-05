import React, { FC } from 'react'
import { Button as BootstrapButton, ButtonProps as BootstrapProps } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Button: FC<Props> = (props) => {
  const bootstrapProps: BootstrapProps = {
    bsPrefix: 'bt-btn',
    className: props.className,
    size: props.size,
    variant: props.variant ?? 'primary'
  }

  if (typeof props.href === 'object') {
    return (
      <BootstrapButton
        {...bootstrapProps}
        as={Link}
        to={props.href.as_link}
      >
        {props.children}
      </BootstrapButton>
    )
  } else {
    return (
      <BootstrapButton {...bootstrapProps} href={props.href}>
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
