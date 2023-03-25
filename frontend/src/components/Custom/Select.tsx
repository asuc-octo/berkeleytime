/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Children,
	ComponentType,
	memo,
	useState,
	cloneElement,
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
import { ReactElement } from 'react-markdown/lib/react-markdown';

const ListContext = createContext<{
	getSize: (index: number) => number;
	setSize: (index: number, size: number) => void;
	isOpen: boolean;
}>({});

const MenuList: ComponentType<MenuListProps> = memo(function MenuList(props) {
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
			height={175}
			itemCount={elements?.length ?? 0}
			itemSize={getSize}
			ref={list}
			width={'100%'}
			onItemsRendered={() => {
				list?.current?.resetAfterIndex(0);
			}}
		>
			{({ index, style }) => {
				const OptionComponent = cloneElement(elements[index] as ReactElement, { index });

				return <div style={style}>{OptionComponent}</div>;
			}}
		</List>
	);
});

const Option: ComponentType<OptionProps & { index: number }> = memo(function Option(props) {
	const { children, innerProps, index, ...rest } = props;
	const { onMouseMove, onMouseOver, ...innerRest } = innerProps;
	const { setSize } = useContext(ListContext);
	const root: MutableRefObject<HTMLDivElement | null> = useRef(null);

	useEffect(() => {
		if (root.current) setSize(index, root.current.getBoundingClientRect().height);
	}, [index, setSize]);

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
	const getSize = useCallback((index: number) => sizes.current[index] || 100, []);
	const setSize = useCallback((index: number, size: number) => {
		sizes.current = { ...sizes.current, [index]: size };
	}, []);

	return (
		<ListContext.Provider value={{ setSize, getSize, isOpen }}>
			<Select
				{...props}
				className={styles.root}
				options={props.options}
				filterOption={props.filterOption}
				onMenuClose={() => set(false)}
				onMenuOpen={() => set(true)}
				components={{ MenuList, Option }}
			/>
		</ListContext.Provider>
	);
};

BTSelect.defaultProps = {
	filterOption: createFilter({ ignoreAccents: false })
};

export default memo(BTSelect);
