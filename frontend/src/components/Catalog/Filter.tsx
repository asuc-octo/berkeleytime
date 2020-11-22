import React, { ChangeEvent, Component, useState } from 'react';
import { ActionMeta, Styles, ValueType } from 'react-select';
import BTSelect from 'components/Custom/Select';
import FilterModal from './FilterModal';

import {
  FilterParameter,
  Filters,
  getChanges,
  getOverlappingValues,
  PlaylistDescription,
  stableSortPlaylists,
} from '../../utils/playlist';
import { Option } from 'react-select/src/filters';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { modifyActivePlaylists } from 'redux/actions/catalog';
import { filter } from 'lodash';

type Props = {
  filters: Filters;
  activeFilters: string[];
  modifyFilters: (add: Set<string>, remove: Set<string>) => void;

  search?: string;
  setSearch: (query: string) => void;

  sort?: string;
  setSort: (sort: CourseSortAttribute) => void;

  isMobile?: boolean;
};

type SortOption = { value: CourseSortAttribute; label: string };
const SORT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: 'Sort By: Relevance' },
  { value: 'average_grade', label: 'Sort By: Average Grade' },
  { value: 'department_name', label: 'Sort By: Department Name' },
  { value: 'open_seats', label: 'Sort By: Open Seats' },
  { value: 'enrolled_percentage', label: 'Sort By: Percent Enrolled' },
];

const DEFAULT_SORT = SORT_OPTIONS[0];

const FilterSidebar = ({
  filters,
  activeFilters,
  modifyFilters,
  search = '',
  setSearch,
  sort = DEFAULT_SORT.value,
  setSort,
  isMobile = false,
}: Props) => {
  const requirementsOptions = filters.requirements;
  const unitsRangeOptions = filters.unitsPlaylist;
  const departmentOptions = filters.departmentsPlaylist;
  const classLevelOptions = filters.levelsPlaylist;
  const semesterOptions = filters.semestersPlaylist;

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modal, setModal] = useState({
    type: '',
    options: [] as PlaylistDescription,
    default: null as FilterParameter[] | null,
    handler: (filters: FilterParameter[]) => {}
  });

  function resetFilters() {
    setSearch('');
    setSort(DEFAULT_SORT.value);
    modifyFilters(new Set(), new Set(activeFilters));
  }

  /**
   * Takes a subset of filters and then updates according to
   * the definitive list of new filters from value.
   */
  const filterHandler = (allOptions: PlaylistDescription) => (
    value?: ValueType<FilterParameter>
  ) => {
    const [add, remove] = getChanges(
      ([] as FilterParameter[]).concat(value || []),
      allOptions
    );
    modifyFilters(add, remove);
  };

  function semesterOpen() {
    setTimeout(() => {
      document.getElementById('filter')?.scroll(0, 500);
    }, 50);
  }

  //show the mobile modals
  function showModal(
    type: string,
    selection: FilterParameter[],
    options: PlaylistDescription,
    handler: (filters: FilterParameter[]) => void
  ) {
    setModal({
      type: type,
      options: options,
      default: selection,
      handler: handler
    });
    setShowFilterModal(true);
  }

  function hideModal() {
    setModal({
      type: '',
      options: [],
      default: null,
      handler: () => {}
    });
    setShowFilterModal(false);
  }

  return !isMobile ? (
    <div id="filter" className="filter">
      <div className="filter-name">
        <p>Filters</p>
        <button type="button" onClick={resetFilters}>
          Reset
        </button>
      </div>
      <div className="filter-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder=" &#xf002;  Search for a class..."
        />
      </div>
      <div className="filter-sort">
        <BTSelect
          options={SORT_OPTIONS}
          isSearchable={false}
          onChange={(e) => setSort((e as SortOption).value)}
          value={SORT_OPTIONS.find((o) => o.value === sort)}
        />
      </div>
      <div className="filter-requirements">
        <p>Requirements</p>
        <BTSelect
          isMulti
          closeMenuOnSelect={false}
          isSearchable={false}
          options={requirementsOptions}
          onChange={filterHandler(requirementsOptions)}
          value={getOverlappingValues(activeFilters, requirementsOptions)}
          placeholder="Select requirements..."
        />
      </div>
      <div className="filter-units">
        <p>Units</p>
        <BTSelect
          closeMenuOnSelect={false}
          isMulti
          placeholder="Specify units..."
          isSearchable={false}
          options={unitsRangeOptions}
          onChange={filterHandler(unitsRangeOptions)}
          value={getOverlappingValues(activeFilters, unitsRangeOptions)}
        />
      </div>
      <div className="filter-department">
        <p>Department</p>
        <BTSelect
          isClearable
          options={departmentOptions}
          onChange={filterHandler(departmentOptions)}
          value={getOverlappingValues(activeFilters, departmentOptions)}
          placeholder="Choose a department..."
        />
      </div>
      <div className="filter-class-level">
        <p>Class Level</p>
        <BTSelect
          closeMenuOnSelect={false}
          isSearchable={false}
          isMulti
          placeholder="Select class levels..."
          options={classLevelOptions}
          onChange={filterHandler(classLevelOptions)}
          value={getOverlappingValues(activeFilters, classLevelOptions)}
        />
      </div>
      <div className="filter-semesters">
        <p>Semesters</p>
        <BTSelect
          closeMenuOnSelect={false}
          isSearchable={false}
          options={semesterOptions}
          onChange={filterHandler(semesterOptions)}
          value={getOverlappingValues(activeFilters, semesterOptions)}
          placeholder="Select semesters..."
          onMenuOpen={semesterOpen}
        />
      </div>
      <div id="filter-end"></div>
    </div>
  ) : (
    <div id="filter" className="filter">
      <div className="filter-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder=" &#xf002;  Search for a class..."
        />
      </div>

      <div className="filter-scroll">
        <button
          className="btn-bt-border filter-scroll-btn blue-text"
          onClick={resetFilters}
        >
          Reset{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'sortBy',
              SORT_OPTIONS.filter((o) => o.value === sort),
              SORT_OPTIONS,
              (p) => setSort((p[0] as SortOption).value)
            )
          }
        >
          Sort&nbsp;By{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'requirements',
              getOverlappingValues(activeFilters, requirementsOptions),
              requirementsOptions,
              filterHandler(requirementsOptions)
            )
          }
        >
          Requirements{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'unitsRange',
              getOverlappingValues(activeFilters, unitsRangeOptions),
              unitsRangeOptions,
              filterHandler(unitsRangeOptions)
            )
          }
        >
          Units{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'department',
              getOverlappingValues(activeFilters, departmentOptions),
              departmentOptions,
              filterHandler(departmentOptions)
            )
          }
        >
          Department{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'classLevels',
              getOverlappingValues(activeFilters, classLevelOptions),
              classLevelOptions,
              filterHandler(classLevelOptions)
            )
          }
        >
          Class&nbsp;Level{' '}
        </button>
        <button
          className="btn-bt-border filter-scroll-btn"
          onClick={() =>
            showModal(
              'semesters',
              getOverlappingValues(activeFilters, semesterOptions),
              semesterOptions,
              filterHandler(semesterOptions)
            )
          }
        >
          Semesters{' '}
        </button>
      </div>
      <FilterModal
        options={modal.options}
        defaultSelection={modal.default}
        showFilters={showFilterModal}
        hideModal={hideModal}
        storeSelection={modal.handler}
        displayRadio={['sortBy', 'department', 'semesters'].includes(
          modal.type
        )}
      />
    </div>
  );
};

export default FilterSidebar;
