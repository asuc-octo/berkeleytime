import { PlaylistType } from "graphql/graphql";

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

/**
 * Converts a list of playlists and extracts all playlists of a specific
 * category.
 */
export function getCategoryFromPlaylists(
    playlists: PlaylistType[],
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
export function playlistsToFilters(data: PlaylistType[]): Filters {
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
