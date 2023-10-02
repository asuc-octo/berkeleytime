import { Message, MessageInput, UserInput } from "../../generated-types/graphql";
import { formatMessage } from "./formatter";
import { MessageModal, MessageType } from "../../db/user";


//get the chat from a user or all chat if no user
export async function messageByUser(sender: string): Promise<Message[]> {
    if (sender) {
        const messages =  await MessageModal.find({sender: sender});
        if (messages.length === 0){
            throw new Error("No such user sending messages");
        }
        return messages.map(formatMessage);
    } else {
        const messages = await MessageModal.find({});
        return messages.map(formatMessage);
    }
}

export async function createMessage(message: MessageInput): Promise<Message>{
    const newMessage = await MessageModal.create(message);
    return formatMessage(newMessage);
}

