import { PropsWithChildren, ReactNode } from 'react';

type Props = {
	title: string;
	className?: string;
	widget?: ReactNode;
};

export default function Subview({ title, className, widget, children }: PropsWithChildren<Props>) {
	return (
		<div className={'profile-subview ' + (className ?? '')}>
			<div className="profile-subview-title">
				<h3>{title}</h3>
				{widget}
			</div>
			<div className="profile-subview-content">{children}</div>
		</div>
	);
}
