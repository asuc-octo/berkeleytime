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
			<div className={styles.sections}>
				<h5>Lectures</h5>
				{lectures && lectures.length > 0 ? (
					lectures.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<span>No lectures available.</span>
				)}
			</div>
			<div className={styles.sections}>
				<h5>Discussions</h5>
				{discussions && discussions.length > 0 ? (
					discussions.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<span>No discussions available.</span>
				)}
			</div>
			<div className={styles.sections}>
				<h5>Labs</h5>
				{labs && labs.length > 0 ? (
					labs.map((section) => <SectionTableItem key={section.id} section={section} />)
				) : (
					<span>No labs available.</span>
				)}
			</div>
		</div>
	);
};

export default SectionTable;
