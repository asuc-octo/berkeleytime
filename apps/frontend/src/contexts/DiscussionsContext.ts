import { createContext } from "react";

// Put Discussions under Course (e.g. COMPSCI 61B)
// Question: include IClass?
import { IDiscussion, ICourse, IUser } from "@/lib/api";

// TODO: ability to update Discussions
export interface DiscussionsContextType {
  comments: IDiscussion[];
  addDiscussion: (DiscussionText: string, user: IUser, course: ICourse) => void;
  fetchDiscussions: (courseId: string) => void;
  filterDiscussionsByUser: (userEmail: string) => void;
}

// Contexts: share states down component tree without passing props (global state management)
const DiscussionsContext = createContext<DiscussionsContextType | null>(null);

export default DiscussionsContext;
