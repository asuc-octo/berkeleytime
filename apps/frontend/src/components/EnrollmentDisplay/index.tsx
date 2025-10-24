import { ReactNode, useState } from "react";

import { getEnrollmentColor } from "@/components/Capacity";

interface EnrollmentDisplayProps {
  enrolledCount?: number;
  maxEnroll?: number;
  children?: (content: ReactNode) => ReactNode;
}

export default function EnrollmentDisplay({
  enrolledCount,
  maxEnroll,
  children,
}: EnrollmentDisplayProps) {
  const [showRawCount, setShowRawCount] = useState(false);

  const hasData = enrolledCount !== undefined && maxEnroll !== undefined;

  if (!hasData) return null;

  const percentage = maxEnroll === 0 ? 0 : Math.round((enrolledCount / maxEnroll) * 100);
  const color = getEnrollmentColor(enrolledCount, maxEnroll);

  const content = (
    <span
      style={{ color, fontSize: '14px' }}
      onMouseEnter={() => setShowRawCount(true)}
      onMouseLeave={() => setShowRawCount(false)}
    >
      {showRawCount
        ? `${enrolledCount}/${maxEnroll} enrolled`
        : `${percentage}% enrolled`
      }
    </span>
  );

  return children ? children(content) : content;
}