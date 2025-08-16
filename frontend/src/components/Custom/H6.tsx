import { PropsWithChildren } from 'react';
import TextProps, { getClassNames } from './TextProps';

export default function H6(props: PropsWithChildren<TextProps>) {
	return <h6 className={getClassNames('bt-h6', props)}>{props.children}</h6>;
}
