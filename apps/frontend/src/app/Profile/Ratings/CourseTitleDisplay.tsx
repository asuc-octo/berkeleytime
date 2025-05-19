import { useReadCourse } from "@/hooks/api/courses/useReadCourse";

interface CourseTitleDisplayProps {
  subject: string;
  courseNumber: string;
}

export function CourseTitleDisplay({ subject, courseNumber }: CourseTitleDisplayProps) {
  const { data: course, loading, error } = useReadCourse(subject, courseNumber);

  if (loading || error) return null;
  
  const displayTitle = course?.title || course?.description;
  if (!displayTitle) return null;

  const courseTitleStyle = {
    fontSize: '14px',
    color: 'var(--paragraph-color)',
    width: '100%',
    display: 'block',
  };

  return <span style={courseTitleStyle}>{displayTitle}</span>;
} 