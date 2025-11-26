import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";

import { type CourseOutput, LIGHT_COLORS } from "../types";

interface UseCourseManagerProps<Input, T> {
  initialInputs: Input[];
  fetchData: (
    client: ReturnType<typeof useApolloClient>,
    input: Input,
    index: number
  ) => Promise<{ data: T; input: Input } | null>;
  serializeInput: (input: Input) => string;
  colors?: string[];
}

export function useCourseManager<Input, T>({
  initialInputs,
  fetchData,
  serializeInput,
  colors = LIGHT_COLORS,
}: UseCourseManagerProps<Input, T>) {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState<boolean>(initialInputs.length > 0);
  const [outputs, setOutputs] = useState<CourseOutput<Input, T>[]>([]);

  // Initialize outputs from URL
  useEffect(() => {
    const initialize = async () => {
      if (!loading) return;
      if (!initialInputs?.[0]) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("input");
        setSearchParams(nextParams);
        return;
      }

      const results = await Promise.all(
        initialInputs.map((input, i) => fetchData(client, input, i))
      );

      const validOutputs = results
        .filter(
          (output): output is { data: T; input: Input } => output !== null
        )
        .slice(0, 4)
        .map((output, index) => ({
          data: output.data,
          input: output.input,
          color: colors[index % colors.length],
          hidden: false,
          active: false,
        }));

      setOutputs(validOutputs);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("input");

      validOutputs.forEach((output) => {
        nextParams.append("input", serializeInput(output.input));
      });

      setSearchParams(nextParams);
      setLoading(false);
    };

    initialize();
  }, [
    client,
    initialInputs,
    searchParams,
    loading,
    fetchData,
    setSearchParams,
  ]);

  const remove = useCallback(
    (index: number) => {
      const currentOutputs = [...outputs];
      currentOutputs.splice(index, 1);
      setOutputs(currentOutputs);

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("input");

      for (const output of currentOutputs) {
        nextParams.append("input", serializeInput(output.input));
      }

      setSearchParams(nextParams);
    },
    [outputs, searchParams, setSearchParams]
  );

  const updateActive = useCallback((index: number, active: boolean) => {
    setOutputs((outputs) =>
      [...outputs].map((output, i) =>
        i === index
          ? { ...output, active }
          : active
            ? { ...output, active: false }
            : output
      )
    );
  }, []);

  const updateHidden = useCallback((index: number, hidden: boolean) => {
    setOutputs((outputs) =>
      [...outputs].map((output, i) =>
        i === index ? { ...output, hidden } : output
      )
    );
  }, []);

  const activeOutput = useMemo(
    () => outputs?.find((out) => out.active),
    [outputs]
  );

  const filteredOutputs = useMemo(
    () => outputs.filter((output) => !output.hidden),
    [outputs]
  );

  return {
    outputs,
    setOutputs,
    loading,
    activeOutput,
    filteredOutputs,
    remove,
    updateActive,
    updateHidden,
  };
}
