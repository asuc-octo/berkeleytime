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
	MutableRefObject,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BTMenuList: ComponentType<MenuListProps<any, any, any>> = memo(function MenuList(props) {
	const { options, getValue, children } = props;
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
			height={200}
			itemCount={elements?.length ?? 0}
			itemSize={getSize}
			ref={list}
			width={'100%'}
			onItemsRendered={() => {
				list?.current?.resetAfterIndex(0);
			}}
		>
			{({ index, style }) => {
				// const OptionComponent = cloneElement(elements[index] as ReactElement, { index });
				return <div style={style}>{elements[index]}</div>;
			}}
		</List>
	);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BTOption: ComponentType<OptionProps<any, any, any>> | undefined = memo(
	function Option(props): JSX.Element {
		const { children, innerProps, ...rest } = props;
		const { onMouseMove, onMouseOver, ...innerRest } = innerProps;
		const { setSize } = useContext(ListContext);
		const root: MutableRefObject<HTMLDivElement | null> = useRef(null);

		// useEffect(() => {
		// 	if (root.current) setSize(index, root.current.getBoundingClientRect().height);
		// }, [index, setSize]);

		const newProps = { ...rest, innerProps: innerRest };

		// console.log(props);

		return (
			<div ref={root}>
				<components.Option {...newProps}>{children}</components.Option>
			</div>
		);
	}
);

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
				components={{ MenuList: BTMenuList, Option: BTOption }}
			/>
		</ListContext.Provider>
	);
};

BTSelect.defaultProps = {
	filterOption: createFilter({ ignoreAccents: false })
};

export default memo(BTSelect);
