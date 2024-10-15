import useCourse from "@/hooks/useCourse";

export default function Classes() {
  const { course } = useCourse();

  return (
    <div>
      {course.classes.map((_class, index) => (
        <div key={index}>
          <h2>
            {_class.year} {_class.semester}
          </h2>
          <p>{_class.title}</p>
        </div>
      ))}
    </div>
  );
}
