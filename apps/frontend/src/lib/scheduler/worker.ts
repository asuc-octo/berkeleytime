import { GenerateRequest, handleRequest } from "./protocol";

// The app's TypeScript config only includes DOM types, so describe the two
// worker globals used here instead of pulling in the WebWorker library.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<GenerateRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

scope.onmessage = (event) => scope.postMessage(handleRequest(event.data));
