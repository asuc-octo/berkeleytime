import { ReactNode, useState } from 'react';

import styles from './CatalogView.module.scss';

interface Props {
	// Here we specify that the component MUST take a string followed by a singular component.
	children: [string, ReactNode];
}

//
// Handles the 'read more' button logic in the CatalogView component.
//
const ReadMore = ({ children }: Props) => {
	const [isRead, setRead] = useState(false);
	const [text, node] = children;

	return (
		<div className={styles.description}>
			{text.length > 150 ? (
				<p>
					{isRead ? text : text.slice(0, 150) + '...'}
					<span onClick={() => setRead((prev) => !prev)}>{isRead ? 'see less' : 'see more'}</span>
				</p>
			) : text !== '' ? (
				text
			) : (
				'There is no description for this course.'
			)}

			{(isRead || text.length < 150) && node}
		</div>
	);
};

export default ReadMore;
