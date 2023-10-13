import { useMemo } from 'react';
import Select from 'react-select';

const style = {
	control: (base) => ({
		...base,
		border: 0,
		boxShadow: 'none'
	})
};

export default function Property({ attribute, value, options, updateMajor, major }) {
	const body = useMemo(() => {
		if (attribute === 'Full Name') {
			return (
				<div className="personal-value">
					<p>{value}</p>
				</div>
			);
		}

		if (attribute === 'Major(s)') {
			return (
				<div className="major-select">
					<Select
						options={options}
						name="major-selector"
						isSearchable={true}
						isClearable={false}
						onChange={updateMajor}
						placeholder="Select major..."
						value={major ? { label: major, value: major } : null}
						components={{
							IndicatorSeparator: () => null
						}}
						styles={style}
					/>
				</div>
			);
		}

		return (
			<div className="personal-value">
				<p>{value}</p>
			</div>
		);
	}, [attribute, options, value, major, updateMajor]);

	return (
		<div className="profile-row">
			<p className="personal-attribute">{attribute}</p>
			{body}
		</div>
	);
}
