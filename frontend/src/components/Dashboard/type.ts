export type CurrentScheduleProps = {
	current: ScheduleSemesterType;
};

export type PastScheduleProps = {
	past: ScheduleSemesterType[];
};

export type ProfileProps = {
	profile: { name: string; pic: string; majors: string[]; academic_career: string; level: string };
};

export type ScheduleSemesterType = {
	semester: string;
	classes: { name: string; units: number }[];
};
