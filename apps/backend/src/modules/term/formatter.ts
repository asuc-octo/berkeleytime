import { ISessionItem, ITermItem } from "@repo/common";

import { TermModule } from "./generated-types/module-types";

const formatSession = (session: ISessionItem) => {
  return {
    ...session,
    startDate: session.beginDate,
    timePeriods: session.timePeriods || [],
  } as TermModule.Session;
};

export const formatTerm = (term: ITermItem) => {
  const [year, semester] = term.name.split(" ");

  return {
    ...term,
    year: parseInt(year),
    semester,
    startDate: term.beginDate,
    sessions: term.sessions?.map(formatSession),
  } as TermModule.Term;
};
