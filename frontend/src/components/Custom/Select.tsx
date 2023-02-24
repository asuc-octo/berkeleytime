import Select, { GroupBase, Props } from 'react-select';

const BTSelect = <
	Option,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>
>(
		props: Props<Option, IsMulti, Group>
	) => {
	return (
		<Select
			{...props}
			components={{
				IndicatorSeparator: () => null
			}}
		/>
	);
};

export default BTSelect;
