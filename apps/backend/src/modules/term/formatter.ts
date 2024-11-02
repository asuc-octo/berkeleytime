import { SessionType, TermType } from "@repo/common";

import { formatDate } from "../class/formatter";
import { TermModule } from "./generated-types/module-types";

export const formatSession = (session: SessionType) => {
  const { name, beginDate, endDate, temporalPosition } = session;

  return {
    name,
    startDate: formatDate(beginDate),
    endDate: formatDate(endDate),
    temporalPosition: temporalPosition as TermModule.TemporalPosition,
  } as TermModule.Session;
};

export const formatTerm = (term: TermType) => {
  const { name, temporalPosition, sessions, beginDate, endDate } = term;

  const [year, semester] = name.split(" ");

  return {
    semester: semester as TermModule.Semester,
    year: parseInt(year),
    temporalPosition: temporalPosition as TermModule.TemporalPosition,
    sessions: sessions.map(formatSession),
    startDate: formatDate(beginDate),
    endDate: formatDate(endDate),
  } as TermModule.Term;
};
