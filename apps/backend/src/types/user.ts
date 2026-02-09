/**
 * Resolved User shape returned by user formatter and expected by resolvers.
 * Used as the mapper type for GraphQL User so resolvers can return this without casts.
 */
export interface FormattedUser {
  _id: string;
  email: string;
  name: string;
  staff: boolean;
  student: boolean;
  majors: string[];
  minors: string[];
}
