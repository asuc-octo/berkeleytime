export default interface TextProps {
  bold?: boolean | 'light'
  className?: string
}

export function getClassNames(base: string, props: TextProps) {
  let boldClassName = ''
  if (props.bold === true) boldClassName = 'bt-bold'
  else if (props.bold === 'light') boldClassName = 'bt-light-bold'

  return (
    [base, boldClassName, props.className ?? ''].join(' ')
  )
}