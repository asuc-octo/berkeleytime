import { PropsWithChildren } from 'react';
import TextProps, { getClassNames } from './TextProps';

export default function H3(props: PropsWithChildren<TextProps>) {
	return <h3 className={getClassNames('bt-h3', props)}>{props.children}</h3>;
}
