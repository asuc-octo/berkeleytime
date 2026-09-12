export interface RequestContext {
  user?: {
    _id?: string;
    email?: string;
    isAuthenticated?: boolean;
    logout?: (callback: (error?: unknown) => void) => void;
  };
}
