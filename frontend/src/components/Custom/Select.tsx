/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Children,
	ComponentType,
	memo,
	useState,
	useEffect,
	useRef,
	useCallback,
	createContext,
	useContext,
	MutableRefObject
} from 'react';
import Select, { components, GroupBase, MenuListProps, OptionProps, Props } from 'react-select';
import { VariableSizeList as List } from 'react-window';
import { createFilter } from 'react-select';

import styles from './Select.module.scss';

const ListContext = createContext<{
	getSize: (index: number) => number;
	setSize: (index: number, size: number) => void;
	isOpen: boolean;
}>({
	getSize: (_) => 0,
	setSize: (_, __) => 0,
	isOpen: false
});

const BTMenuList: ComponentType<MenuListProps<any, any, any>> = memo(function MenuList(props) {
	const { options, getValue, children, maxHeight } = props;
	const [value] = getValue();
	const list: MutableRefObject<List | null> = useRef(null);
	const elements = Children.toArray(children);
	const { getSize, isOpen } = useContext(ListContext);

	useEffect(() => {
		list?.current?.resetAfterIndex(0);
		if (list?.current && isOpen) list.current.scrollToItem(options.indexOf(value) + 3);
	}, [isOpen, options, value]);

	return (
		<List
			height={maxHeight}
			itemCount={elements?.length ?? 0}
			itemSize={getSize}
			ref={list}
			width={'100%'}
			onItemsRendered={() => {
				list?.current?.resetAfterIndex(0);
			}}
			onScroll={() => {
				list?.current?.resetAfterIndex(0);
			}}
		>
			{({ index, style }) => {
				return <div style={style}>{elements[index]}</div>;
			}}
		</List>
	);
});

const BTOption: ComponentType<OptionProps<any, any, any>> | undefined = memo(function Option(
	props
) {
	const { children, innerProps, ...rest } = props;
	const { onMouseMove, onMouseOver, ...innerRest } = innerProps;
	const { setSize } = useContext(ListContext);
	const root: MutableRefObject<HTMLDivElement | null> = useRef(null);
	useEffect(() => {
		if (root.current) {
			// The IDs take the form: react-select-191-option-407
			// Here we regex everything after the last hyphen to obtain the index of the item in the list.
			// The alternative is using `cloneElement` with the index but this seems reliable.
			const index = innerProps?.id?.match('(?<=-)[^-]*$') ?? null;
			if (index) setSize(parseInt(index[0], 10), root.current.getBoundingClientRect().height);
		}
	}, [root, innerProps?.id, setSize]);

	const newProps = { ...rest, innerProps: innerRest };

	return (
		<div ref={root}>
			<components.Option {...newProps}>{children}</components.Option>
		</div>
	);
});

const BTSelect = <
	Option,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>
>(
	props: Props<Option, IsMulti, Group>
) => {
	const sizes: MutableRefObject<Record<number, number>> = useRef({});
	const [isOpen, set] = useState(false);
	const getSize = useCallback((index: number) => sizes.current[index] || 35, []);
	const setSize = useCallback((index: number, size: number) => {
		sizes.current = { ...sizes.current, [index]: size };
	}, []);

	return (
		<ListContext.Provider value={{ setSize, getSize, isOpen }}>
			<Select
				{...props}
				className={styles.root}
				onMenuClose={() => set(false)}
				onMenuOpen={() => set(true)}
				components={{
					MenuList: BTMenuList as ComponentType<MenuListProps<Option, IsMulti, Group>>,
					Option: BTOption as ComponentType<OptionProps<Option, IsMulti, Group>>
				}}
			/>
		</ListContext.Provider>
	);
};

BTSelect.defaultProps = {
	filterOption: createFilter({ ignoreAccents: false })
};

export default BTSelect;
