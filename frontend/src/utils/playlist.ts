import { FilterFragment } from '../graphql/graphql';

export type FilterablePlaylist = FilterFragment;
export type FilterParameter = {
  value: string;
  label: string;
};

export type CategorizedFilterParameter = {
  label: string;
  options: FilterParameter[];
};

export type Filters = {
  requirements: CategorizedFilterParameter[];
  departmentsPlaylist: FilterParameter[];
  unitsPlaylist: FilterParameter[];
  levelsPlaylist: FilterParameter[];
  semestersPlaylist: FilterParameter[];
};

export type PlaylistDescription = (FilterParameter | CategorizedFilterParameter)[];

export type ParameterChange = [add: Set<string>, remove: Set<string>];

const SEMESTER_TYPE_TO_OFFSET: { [key: string]: number } = {
  spring: 0.0,
  summer: 0.1,
  fall: 0.2,
};

// Higher = appear further behind
const PLAYLIST_CATEGORY_TO_ORDER: { [key: string]: number } = {
  units: 2.0,
};

/**
 * Converts a playlist to a quantifiable year value. Greater = newer
 */
export function playlistToTimeComparable(playlist: FilterablePlaylist): number {
  if (playlist.category === 'semester') {
    const [semester, year] = playlist.name.toLowerCase().split(' ');
    return +year + SEMESTER_TYPE_TO_OFFSET[semester];
  } else {
    return +playlist.year + SEMESTER_TYPE_TO_OFFSET[playlist.semester]!;
  }
}

/**
 * Sorts a list of playlists in a consistent manner.
 */
export function stableSortPlaylists(
  playlists: FilterablePlaylist[],
  maxSemesters: number = Infinity
): FilterablePlaylist[] {
  const semesterPlaylists = playlists
    .filter((p) => p.category === 'semester')
    .sort((a, b) => playlistToTimeComparable(b) - playlistToTimeComparable(a))
    .slice(0, maxSemesters);

  const unitPlaylists = playlists.filter((p) => p.category === 'units');

  const otherPlaylists = playlists
    .filter((p) => !['units', 'semester'].includes(p.category))
    .sort((a, b) => a.name.localeCompare(b.name));

  return otherPlaylists.concat(unitPlaylists, semesterPlaylists);
}

/**
 * Gets the latest semester from a list of playlists.
 */
export function getLatestSemester(
  playlists: FilterablePlaylist[]
): FilterablePlaylist | null {
  const semesterPlaylists = playlists
    .filter((p) => p.category === 'semester')
    .sort((a, b) => playlistToTimeComparable(b) - playlistToTimeComparable(a));

  return semesterPlaylists[0] || null;
}

/**
 * Converts a list of playlists and extracts all playlists of a specific
 * category.
 */
export function getCategoryFromPlaylists(
  playlists: FilterablePlaylist[],
  parameter: string,
  process: (label: string) => string = (s) => s
): FilterParameter[] {
  return playlists
    .filter((playlist) => playlist.category === parameter)
    .map((playlist) => ({
      value: playlist.id,
      label: process(playlist.name),
    }));
}

/**
 * Builds the playlists returned by the catalog API into objects
 * that can be passed to by react-select. Each dropdown takes an options
 * list of { value: ..., label: ... } objects. The requirements dropdown
 * takes a list of { label: ..., options: ... } since each option is
 * categorized under a section.  This returns the options lists for each filter dropdown.
 */
export function playlistsToFilters(rawData: FilterablePlaylist[]): Filters {
  const data = stableSortPlaylists(rawData);
  const requirements = [];

  requirements.push({
    label: 'University Requirements',
    options: getCategoryFromPlaylists(data, 'university'),
  });

  requirements.push({
    label: 'L&S Breadths',
    options: getCategoryFromPlaylists(data, 'ls'),
  });

  requirements.push({
    label: 'College of Engineering',
    options: getCategoryFromPlaylists(data, 'engineering'),
  });

  requirements.push({
    label: 'Haas Breadths',
    options: getCategoryFromPlaylists(data, 'haas'),
  });

  const departmentsPlaylist = getCategoryFromPlaylists(data, 'department');
  if (departmentsPlaylist[0].label === '-') {
    // remove non-existent department???
    departmentsPlaylist.splice(0, 1);
  }

  const unitsPlaylist = getCategoryFromPlaylists(data, 'units', (label) =>
    label === '5 Units' ? '5+ Units' : label
  );

  const levelsPlaylist = getCategoryFromPlaylists(data, 'level');

  const semestersPlaylist = getCategoryFromPlaylists(data, 'semester');

  return {
    requirements,
    departmentsPlaylist,
    unitsPlaylist,
    levelsPlaylist,
    semestersPlaylist,
  };
}

/**
 * Gets the relevant matching filters
 */
export function getPlaylistEntries(playlist: PlaylistDescription): FilterParameter[] {
  if (playlist.length === 0) {
    return [];
  }

  if ('value' in playlist[0]) {
    return playlist as FilterParameter[];
  } else {
    return (playlist as CategorizedFilterParameter[]).flatMap(
      (section) => section.options
    );
  }
}

/**
 * Gets the values that overlap a playlist.
 */
export function getOverlappingValues(values: string[], playlist: PlaylistDescription): FilterParameter[] {
  const allValues = getPlaylistEntries(playlist);
  const overlap = allValues.filter(opt => values.includes(opt.value));
  return overlap;
}

/**
 * Get changes.
 */
export function getChanges(
  selectedParameters: Pick<FilterParameter, 'value'>[],
  allParameters: PlaylistDescription
): ParameterChange {
  const add = new Set<string>();
  const remove = new Set<string>();

  for (const selected of selectedParameters) {
      add.add(selected.value);
  }

  const allParameterValues = getPlaylistEntries(allParameters);
  for (const param of allParameterValues) {
    if (!add.has(param.value)) {
      remove.add(param.value);
    }
  }

  return [add, remove];
}
