import { useParams } from "react-router-dom";

import Component from "@/components/Course";

export default function Course() {
  const { subject, number } = useParams();

  return <Component subject={subject as string} number={number as string} />;
}
