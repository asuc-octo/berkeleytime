/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Children,
	ComponentType,
	memo,
	useEffect,
	useRef,
	useCallback,
	createContext,
	useContext,
	MutableRefObject,
	useState
} from 'react';
import Select, { components, GroupBase, MenuListProps, OptionProps, Props } from 'react-select';
import { VariableSizeList as List } from 'react-window';
import { createFilter } from 'react-select';

import styles from './Select.module.scss';
import Fuse from 'fuse.js';
import { laymanTerms } from '../../lib/courses/course';

const ListContext = createContext<{
	getSize: (index: number) => number;
	setSize: (index: number, size: number) => void;
}>({
	getSize: (_) => 0,
	setSize: (_, __) => 0
});

const BTMenuList: ComponentType<MenuListProps<any, any, any>> = memo(function MenuList(props) {
	const { options, getValue, children, maxHeight } = props;
	const { menuIsOpen } = props.selectProps;
	const [value] = getValue();
	const list: MutableRefObject<List | null> = useRef(null);
	const elements = Children.toArray(children);
	const sizes: MutableRefObject<Record<number, number>> = useRef({});
	const getSize = useCallback((index: number) => sizes.current[index] || 35, []);
	const setSize = useCallback((index: number, size: number) => {
		sizes.current = { ...sizes.current, [index]: size };
	}, []);

	useEffect(() => {
		list?.current?.resetAfterIndex(0);
		if (list?.current && menuIsOpen) list.current.scrollToItem(options.indexOf(value) + 3);
	}, [options, menuIsOpen, value]);

	const reset = () => {
		list?.current?.resetAfterIndex(0);
	};

	// If we are dealing with a nested 'group select', just use the default component.
	// with no custom virtualization
	if (options.every(({ options }) => typeof options === 'object'))
		return <components.MenuList {...props} />;

	return (
		<ListContext.Provider value={{ setSize, getSize }}>
			<List
				height={200}
				itemCount={elements.length}
				itemSize={getSize}
				ref={list}
				width={'100%'}
				onItemsRendered={reset}
				onScroll={reset}
			>
				{({ index, style }) => {
					return <div style={style}>{elements[index]}</div>;
				}}
			</List>
		</ListContext.Provider>
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
			const index = innerProps?.id?.match(/\d+(?=[^\d]*$)/) ?? null;
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
	props: Props<Option, IsMulti, Group> & { courseSearch?: boolean }
) => {
	const [dynamicOptions, setDynamic] = useState(props.options);

	useEffect(() => {
		setDynamic(props.options);
	}, [props.options]);

	const handleInputChange = (value: string, { action }: { action: string }) => {
		if (action === 'input-change') {
			const { options } = props;
			if (!value || value === '' || value === null) return;

			if (options) {
				const fuseOptions: Fuse.IFuseOptions<any> = {
					includeScore: true,
					shouldSort: true,
					findAllMatches: false,
					distance: 10,
					threshold: 0.2,
					keys: [
						{ name: 'abbreviation', weight: 2 },
						{ name: 'abbreviations', weight: 1 },
						{ name: 'courseNumber', weight: 1 },
						{ name: 'fullCourseCode', weight: 1 }
					],
					// The fuse types are wrong for this sort fn
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					sortFn: (itemA: any, itemB: any) => {
						// Sort first by sort score
						if (itemA.score - itemB.score) return itemA.score - itemB.score;

						// if the scores are the same, sort by the course number
						const a = itemA.item[3].v;
						const b = itemB.item[3].v;
						return a.toLowerCase().localeCompare(b.toLowerCase());
					}
				};

				const courseInfo = options.map((option) => {
					const { abbreviation, course_number } = (option as any).course;
					const abbreviations =
						laymanTerms[abbreviation.toLowerCase()]?.reduce((acc, abbr) => {
							return [...acc, ...[`${abbr}${course_number}`, `${abbr} ${course_number}`]];
						}, [] as string[]) ?? [];

					return {
						abbreviation,
						courseNumber: course_number,
						fullCourseCode: `${abbreviation} ${course_number}`,
						abbreviations
					};
				});

				const fuse = new Fuse(courseInfo, fuseOptions);
				setDynamic(fuse.search(value.trim().toLowerCase()).map((res) => options[res.refIndex]));
			}
		} else if (action === 'menu-close') {
			setDynamic(props.options);
		}
	};

	return (
		<Select
			{...props}
			options={dynamicOptions}
			onInputChange={props.courseSearch ? handleInputChange : props.onInputChange}
			filterOption={props.courseSearch ? null : props.filterOption}
			className={`${styles.root} ${props.className}`}
			menuPlacement="auto"
			components={{
				MenuList: BTMenuList as ComponentType<MenuListProps<Option, IsMulti, Group>>,
				Option: BTOption as ComponentType<OptionProps<Option, IsMulti, Group>>
			}}
		/>
	);
};

BTSelect.defaultProps = {
	filterOption: createFilter({ ignoreAccents: false }),
	courseSearch: false
};

export default BTSelect;
