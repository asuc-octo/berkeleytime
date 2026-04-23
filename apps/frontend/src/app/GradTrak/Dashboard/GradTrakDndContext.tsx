import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type GradTrakDndValue = {
  isDraggingPlanCourse: boolean;
  setDraggingPlanCourse: (v: boolean) => void;
};

const GradTrakDndContext = createContext<GradTrakDndValue | null>(null);

export function GradTrakDndProvider({ children }: { children: ReactNode }) {
  const [isDraggingPlanCourse, setDraggingPlanCourse] = useState(false);
  const value = useMemo(
    () => ({ isDraggingPlanCourse, setDraggingPlanCourse }),
    [isDraggingPlanCourse]
  );
  return (
    <GradTrakDndContext.Provider value={value}>
      {children}
    </GradTrakDndContext.Provider>
  );
}

export function useGradTrakDnd(): GradTrakDndValue {
  const v = useContext(GradTrakDndContext);
  if (!v) {
    return { isDraggingPlanCourse: false, setDraggingPlanCourse: () => {} };
  }
  return v;
}
