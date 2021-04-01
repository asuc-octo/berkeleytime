import React, { FC, MouseEventHandler } from 'react'
import { Button as BsButton, ButtonProps as BsProps } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// we use bt- prefixed variants instead of bootstrap variants
// see _buttons.scss

const Button: FC<Props> = (props) => {
  const bsProps: BsProps = {
    className: (props.className ?? '') + (props.disabled ? 'disabled' : ''),
    size: props.size,
    variant: `bt-${props.variant ?? 'primary'}`,
    onClick: props.onClick,
  }

  if (typeof props.href === 'object') {
    return (
      <BsButton
        {...bsProps}
        as={Link}
        to={props.href.as_link}
      >
        {props.children}
      </BsButton>
    )
  } else {
    return (
      <BsButton {...bsProps} href={props.href}>
        {props.children}
      </BsButton>
    )
  }
}

export interface Props {
  className?: string
  variant?: 'primary' | 'primary-inverted' | 'danger' | 'danger-inverted'
  size?: 'sm'
  href?: string | { as_link: string }
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
}

export default Button