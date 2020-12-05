export default interface TextProps {
  bold?: boolean | 'light'
  className?: string
}

export function getClassNames(base: string, props: TextProps) {
  let bold = ''
  if (props.bold === true) bold = 'bt-bold'
  else if (props.bold === 'light') bold = 'bt-light-bold'

  return (
    [base, bold, props.className ?? ''].join(' ')
  )
}
