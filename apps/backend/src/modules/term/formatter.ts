import { ISessionItem, ITermItem } from "@repo/common";

import { TermModule } from "./generated-types/module-types";

const formatSession = (session: ISessionItem) => {
  return {
    ...session,
    startDate: session.beginDate,
    enrollBeginDate: session.enrollBeginDate,
    enrollEndDate: session.enrollEndDate,
  } as TermModule.Session;
};

export const formatTerm = (term: ITermItem) => {
  const [year, semester] = term.name.split(" ");

  return {
    ...term,
    year: parseInt(year),
    semester,
    startDate: term.beginDate,
    selfServiceEnrollBeginDate: term.selfServiceEnrollBeginDate,
    selfServiceEnrollEndDate: term.selfServiceEnrollEndDate,
    sessions: term.sessions?.map(formatSession),
  } as TermModule.Term;
};
