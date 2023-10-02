import { createMessage, messageByUser } from "./controller"
import { ChatModule } from "./generated-types/module-types";

const resolvers: ChatModule.Resolvers = {
    Query: {
        messageByUser(_, args) {
            if (args.sender && args.sender !== ""){
                return messageByUser(args.sender);
            }
            return messageByUser("");
        },
    },
    Mutation: {
        createMessage(_, args) {
            return createMessage(args.message);
        }
    }
};

export default resolvers;
