export type FilterType =
  | 'requirements'
  | 'units'
  | 'department'
  | 'level'
  | 'semesters';

/**
 * Gets the human-readable name for a filter type
 */
export function filterTypeToString(filterType: FilterType): string {
  switch (filterType) {
    case 'requirements':
      return 'Requirements';
    case 'units':
      return 'Units';
    case 'department':
      return 'Department';
    case 'level':
      return 'Class Level';
    case 'semesters':
      return 'Semesters';
  }
}

/**
 * If the filter type should be searchable
 */
export function filterTypeIsSearchable(filterType: FilterType): boolean {
  switch (filterType) {
    case 'department':
      return true;
    default:
      return false;
  }
}

/**
 * Gets if the filter type should support selecting multiple items.
 */
export function filterTypeIsMulti(filterType: FilterType): boolean {
  switch (filterType) {
    case 'semesters':
    case 'department':
      return true;
    default:
      return true;
  }
}

/**
 * Gets the human-readable name for a filter type
 */
export function filterTypeToPlaceholder(filterType: FilterType): string {
  switch (filterType) {
    case 'requirements':
      return 'Select requirements...';
    case 'units':
      return 'Specify units...';
    case 'department':
      return 'Choose a department...';
    case 'level':
      return 'Select class levels...';
    case 'semesters':
      return 'Select semesters...';
  }
}
