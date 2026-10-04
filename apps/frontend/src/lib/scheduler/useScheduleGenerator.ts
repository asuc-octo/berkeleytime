import { RefObject, useEffect, useMemo, useRef, useState } from "react";

import { GeneratorPreferences } from "./preferences";
import {
  GenerateRequest,
  GenerateResponse,
  handleRequest,
  toGeneratorClasses,
  toGeneratorEvents,
} from "./protocol";
import { GenerateResult, GeneratorClass, GeneratorEvent } from "./types";

interface Request {
  classes: GeneratorClass[];
  events: GeneratorEvent[];
  preferences: GeneratorPreferences;
  count: number;
}

interface Response {
  request: Request;
  result: GenerateResult | null;
  error: string | null;
}

let nextRequestId = 0;

const getWorker = (ref: RefObject<Worker | null>) => {
  if (ref.current) return ref.current;
  if (typeof Worker === "undefined") return null;

  try {
    ref.current = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  } catch {
    return null;
  }

  return ref.current;
};

/**
 * Runs `generateSchedules` in a Web Worker so a long search never blocks the
 * page. Responses to outdated inputs are dropped. Where workers are missing
 * or fail to load, the same code runs on the main thread instead.
 *
 * While only `count` grows (Show more), the previous result stays visible
 * until the new one arrives; any other input change clears it, so results
 * for old preferences are never shown.
 */
export const useScheduleGenerator = ({
  classes,
  events,
  preferences,
  count,
  enabled,
}: Request & { enabled: boolean }) => {
  const request = useMemo<Request | null>(
    () => (enabled ? { classes, events, preferences, count } : null),
    [enabled, classes, events, preferences, count]
  );
  const [response, setResponse] = useState<Response | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!request) return;

    let cancelled = false;
    const message: GenerateRequest = {
      id: ++nextRequestId,
      classes: toGeneratorClasses(request.classes),
      events: toGeneratorEvents(request.events),
      preferences: request.preferences,
      options: { count: request.count },
    };

    const receive = (data: GenerateResponse) => {
      if (cancelled || data.id !== message.id) return;
      setResponse({
        request,
        result: "result" in data ? data.result : null,
        error: "error" in data ? data.error : null,
      });
    };

    // Deferred so state is never set synchronously inside the effect.
    const runOnMainThread = () =>
      setTimeout(() => receive(handleRequest(message)), 0);

    const worker = getWorker(workerRef);
    if (!worker) {
      const timer = runOnMainThread();
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    const onMessage = (event: MessageEvent<GenerateResponse>) =>
      receive(event.data);
    const onError = () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      runOnMainThread();
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage(message);

    return () => {
      cancelled = true;
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
  }, [request]);

  const current = request && response?.request === request ? response : null;
  const sameInputs =
    request &&
    response &&
    response.request.classes === request.classes &&
    response.request.events === request.events &&
    response.request.preferences === request.preferences;

  return {
    result: current?.result ?? (sameInputs ? response.result : null),
    error: current?.error ?? null,
    loading: request !== null && current === null,
  };
};
