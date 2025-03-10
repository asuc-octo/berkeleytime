import { createContext } from "react";

// Put Discussions under Course (e.g. COMPSCI 61B)
// Question: include IClass?
import { IDiscussion } from "@/lib/api";

// TODO: ability to update Discussions
export interface DiscussionContextType {
  comments: IDiscussion[];
  addDiscussion: (
    DiscussionText: string,
    userId: string,
    courseId: string
  ) => void;
  fetchDiscussions: (courseId: string) => void;
  filterDiscussionsByUser: (userId: string) => void;
}

// Contexts: share states down component tree without passing props (global state management)
const DiscussionContext = createContext<DiscussionContextType | null>(null);

export default DiscussionContext;
