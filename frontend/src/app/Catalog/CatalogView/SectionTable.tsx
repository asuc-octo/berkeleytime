import { SectionFragment } from 'graphql';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import styles from './CatalogView.module.scss';
import SectionTableItem from './SectionTableItem';

interface Props {
	sections: SectionFragment[] | null;
}

const SectionTable = ({ sections }: Props) => {
	const [lectures, discussions, labs] = useMemo(() => {
		if (!sections) return [[], [], []];

		const lectures = sections.filter((section) => section.kind === 'Lecture');
		const discussions = sections.filter((section) => section.kind === 'Discussion');
		const labs = sections.filter((section) => section.kind === 'Laboratory');

		return [lectures, discussions, labs];
	}, [sections]);

	if (!sections || sections.length === 0) {
		return (
			<Skeleton
				className={styles.sectionItem}
				count={6}
				height={65}
				style={{ marginBottom: '10px' }}
			/>
		);
	}

	return (
		<div className={styles.sectionRoot}>
			<div className={styles.sectionItem}>
				<h5>Lectures</h5>
				{lectures && lectures.length > 0 ? (
					lectures.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<p>No lectures available.</p>
				)}
			</div>
			<div className={styles.sectionItem}>
				<h5>Discussions</h5>
				{discussions && discussions.length > 0 ? (
					discussions.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<p>No discussions available.</p>
				)}
			</div>
			<div className={styles.sectionItem}>
				<h5>Labs</h5>
				{labs && labs.length > 0 ? (
					labs.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<p>No labs available.</p>
				)}
			</div>
		</div>
	);
};

export default SectionTable;
