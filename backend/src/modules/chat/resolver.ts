import { ChatModule } from "./generated-types/module-types";
import { getAllMessages, getAllMessagesByUser, sendMessage} from "./controller";

const resolvers: ChatModule.Resolvers = {
    Query: {
        getMessages: (_parent, { user }) => {
            if (user) {
                return getAllMessagesByUser(user);
            } else {
                return getAllMessages();
            }
        }
    },
    Mutation: {
        sendMessage: (_parent, { content, user }) => {
            return sendMessage(content, user);
        }
    }
};

export default resolvers;