import { PropsWithChildren } from 'react';
import TextProps, { getClassNames } from './TextProps';

export default function P(props: PropsWithChildren<TextProps>) {
	return <p className={getClassNames('bt-p', props)}>{props.children}</p>;
}
