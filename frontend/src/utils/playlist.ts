import { FilterFragment } from "../graphql/graphql";

type FilterablePlaylist = FilterFragment;
type FilterParameter = {
    value: string;
    label: string;
};

type Filters = {
    requirements: {
        label: string;
        options: FilterParameter[];
    }[];
    departmentsPlaylist: FilterParameter[];
    unitsPlaylist: FilterParameter[];
    levelsPlaylist: FilterParameter[];
    semestersPlaylist: FilterParameter[];
};

const SEMESTER_TYPE_TO_OFFSET: { [key: string]: number } = {
    "spring": 0.0,
    "summer": 0.1,
    "fall": 0.2
};

// Higher = appear further behind
const PLAYLIST_CATEGORY_TO_ORDER: { [key: string]: number } = {
    "units": 2.0
};

/**
 * Converts a playlist to a quantifiable year value. Greater = newer
 */
export function playlistToTimeComparable(playlist: FilterablePlaylist): number {
    if (playlist.category === "semester") {
        const [semester, year] = playlist.name.toLowerCase().split(" ");
        return (+year) + SEMESTER_TYPE_TO_OFFSET[semester];
    } else {
        return (+playlist.year) + SEMESTER_TYPE_TO_OFFSET[playlist.semester]!;
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
        .filter(p => p.category === "semester")
        .sort((a, b) => playlistToTimeComparable(b) - playlistToTimeComparable(a))
        .slice(0, maxSemesters);

        console.log(semesterPlaylists);

    const unitPlaylists = playlists
        .filter(p => p.category === "units");

    const otherPlaylists = playlists
        .filter(p => !["units", "semester"].includes(p.category))
        .sort((a, b) => a.name.localeCompare(b.name));

    return otherPlaylists.concat(unitPlaylists, semesterPlaylists);
}

/**
 * Gets the latest semester from a list of playlists.
 */
export function getLatestSemester(playlists: FilterablePlaylist[]): FilterablePlaylist | null {
    const semesterPlaylists = playlists
        .filter(p => p.category === "semester")
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
    process: (label: string) => string = s => s
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
export function playlistsToFilters(data: FilterablePlaylist[]): Filters {
    const requirements = [];

    requirements.push({
        label: "University Requirements",
        options: getCategoryFromPlaylists(data, "university")
    });

    requirements.push({
        label: "L&S Breadths",
        options: getCategoryFromPlaylists(data, "ls")
    });

    requirements.push({
        label: "College of Engineering",
        options: getCategoryFromPlaylists(data, "engineering")
    });

    requirements.push({
        label: "Haas Breadths",
        options: getCategoryFromPlaylists(data, "haas")
    });

    const departmentsPlaylist = getCategoryFromPlaylists(data, "department");
    if (departmentsPlaylist[0].label === "-") {
        // remove non-existent department???
        departmentsPlaylist.splice(0, 1);
    }

    const unitsPlaylist = getCategoryFromPlaylists(data, "units",
        label => label === "5 Units" ? "5+ Units" : label);

    const levelsPlaylist = getCategoryFromPlaylists(data, "level");

    const semestersPlaylist = getCategoryFromPlaylists(data, "semester");

    return {
        requirements,
        departmentsPlaylist,
        unitsPlaylist,
        levelsPlaylist,
        semestersPlaylist,
    };
}
