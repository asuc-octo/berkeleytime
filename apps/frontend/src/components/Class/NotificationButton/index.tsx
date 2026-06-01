import { useCallback } from "react";

import { Bell, BellNotificationSolid } from "iconoir-react";

import { IconButton, Tooltip } from "@repo/theme";

import { useUpdateUser } from "@/hooks/api/users/useUpdateUser";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

interface NotificationButtonProps {
  classInfo?: {
    year: number;
    semester: Semester;
    sessionId?: string | null;
    subject: string;
    courseNumber: string;
    number: string;
  };
  disabled?: boolean;
}

export default function NotificationButton({
  classInfo,
  disabled = false,
}: NotificationButtonProps) {
  const { user } = useUser();
  const [updateUser] = useUpdateUser();

  const isMonitored = user?.monitoredClasses?.some(
    (mc) =>
      mc?.class?.subject === classInfo?.subject &&
      mc?.class?.courseNumber === classInfo?.courseNumber &&
      mc?.class?.number === classInfo?.number &&
      mc?.class?.year === classInfo?.year &&
      mc?.class?.semester === classInfo?.semester
  );

  const toggle = useCallback(async () => {
    if (!user) {
      signIn();
      return;
    }
    if (!classInfo) return;

    const current = user.monitoredClasses ?? [];

    const updated = isMonitored
      ? current.filter(
          (mc) =>
            !(
              mc?.class?.subject === classInfo.subject &&
              mc?.class?.courseNumber === classInfo.courseNumber &&
              mc?.class?.number === classInfo.number &&
              mc?.class?.year === classInfo.year &&
              mc?.class?.semester === classInfo.semester
            )
        )
      : [
          ...current,
          {
            class: {
              year: classInfo.year,
              semester: classInfo.semester,
              sessionId: classInfo.sessionId,
              subject: classInfo.subject,
              courseNumber: classInfo.courseNumber,
              number: classInfo.number,
            },
          },
        ];

    await updateUser({
      monitoredClasses: updated.map((mc) => ({
        class: {
          year: mc!.class!.year!,
          semester: mc!.class!.semester!,
          sessionId: mc?.class?.sessionId,
          subject: mc!.class!.subject!,
          courseNumber: mc!.class!.courseNumber!,
          number: mc!.class!.number!,
        },
      })),
    });
  }, [user, classInfo, isMonitored, updateUser]);

  const label = isMonitored
    ? "Turn off notifications"
    : "Notify me when this class is about to be full";

  return (
    <Tooltip
      title={label}
      trigger={
        <IconButton
          aria-label={label}
          disabled={disabled || !classInfo}
          onClick={toggle}
        >
          {isMonitored ? <BellNotificationSolid /> : <Bell />}
        </IconButton>
      }
    />
  );
}
