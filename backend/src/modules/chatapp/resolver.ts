import { getAllMessagesByUser, getAllMessages, sendNewMessage } from "./controller";
import { ChatappModule } from "./generated-types/module-types";
import { MessageInput } from "../../generated-types/graphql";

const resolvers: ChatappModule.Resolvers = {
    Query: {
        getMessages(_parent, args: { input: MessageInput }) {
            if (args.input.sender) {
                return getAllMessagesByUser(args.input.sender);
            } else {
                return getAllMessages();
            }
        }
    },
    Mutation: {
        sendMessage(_parent, args: { sender: string, receiver: string, message: string}) {
            return sendNewMessage(args.sender, args.receiver, args.message);
        },
    }
};
  
export default resolvers;  