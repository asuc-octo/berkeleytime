
// no constructor

import { IPlan } from "@/lib/api";
import { Column, columnAdapter } from "./column";
import { Data } from "../types";

export type Plan = {
  columns: Data<Column[]>;
};

export const definedFields = ["columns"];

export function planAdapter(plan: IPlan): Plan {
  return {
    columns: {
      data: plan.planTerms.map(columnAdapter),
      type: "List<Column>"
    }
  }
}