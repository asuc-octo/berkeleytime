import { Dispatch, SetStateAction, useEffect } from "react";
import { IPlan } from "../api";
import { run } from "./interpreter";
import { VARIABLE_MAP } from "./language";
import { planAdapter } from "./lib/plan";

export default function LogicEngineInterface(plan: IPlan | undefined, setRequirements: Dispatch<SetStateAction<string>>) {

  const tempCode = `Column col get_element<Column>(get_attr<Plan>(this, "columns"), 0)
string out get_attr<Column>(col, "name")`

  useEffect(() => {
    if (!plan) return;
    VARIABLE_MAP.clear();
    VARIABLE_MAP.set("this", { data: planAdapter(plan), type: "Plan" });
    const result = run(tempCode);
    setRequirements(result.get("out")?.data ?? "");
  }, [plan])
}