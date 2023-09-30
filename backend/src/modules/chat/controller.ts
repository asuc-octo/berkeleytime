import { MessageModel } from "../../db/chat";
import { Message, MessageInput } from "../../generated-types/graphql";
import { formatMessage } from "./formatter";

export async function getAllMessages(userID?: String) : Promise<Message[]> {
    if (userID != null) {
        return await MessageModel.find({created_by: userID});
    } else {
        return await MessageModel.find();
    }
}

export async function createMessage(message: MessageInput) : Promise<Message> {
    const newMessage = await MessageModel.create(message);
    return formatMessage(newMessage);
}