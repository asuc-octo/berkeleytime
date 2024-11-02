import useCourse from "@/hooks/useCourse";

export default function Overview() {
  const { course } = useCourse();

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
    </div>
  );
}
