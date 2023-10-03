import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import TextProps, { getClassNames } from './TextProps';

export interface Props extends TextProps {
	href?: string | { as_link: string };
}

export default function A(props: PropsWithChildren<Props>) {
	if (typeof props.href === 'object') {
		return (
			<Link to={props.href.as_link} className={getClassNames('bt-a', props)}>
				{props.children}
			</Link>
		);
	} else {
		return (
			<a href={props.href} className={getClassNames('bt-a', props)}>
				{props.children}
			</a>
		);
	}
}
