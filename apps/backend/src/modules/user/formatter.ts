import { UserType } from "@repo/common/models";

export const formatUser = (user: UserType) => {
  return {
    _id: user._id as unknown as string,
    email: user.email,
    staff: user.staff,
    name: user.name,
    student: user.email.endsWith("@berkeley.edu"),
    majors: user.majors ? user.majors : [],
    minors: user.minors ? user.minors : [],
    notificationsOn: user.notificationsOn ?? false,
    monitoredClasses: [] as { class: object; thresholds: number[] }[],
  };
};
