export interface RequestContext {
  user?: {
    _id?: string;
    email?: string;
    isAuthenticated?: boolean;
  };
}
