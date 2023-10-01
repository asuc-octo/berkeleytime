import { formatIndividualMessages} from "./formatter";
import { Message } from "../../generated-types/graphql";
import { MessageModel} from "../../db/chat";

export async function getAllMessages(): Promise<Message[]> {
    const messages = await MessageModel.find({})
    if (messages.length == 0) {
        throw new Error("No messages found!")
    }
    return messages.map(formatIndividualMessages)
} 

export async function getAllMessagesByUser(userID: string): Promise<Message[]> {
    // Search all messages for a user 
    const messages = await MessageModel.find({sender: userID})
    if (messages.length == 0) {
        throw new Error("No messages found for this user")
    }
    return messages.map(formatIndividualMessages)
}

export async function sendMessage(content: string, userID: string): Promise<Message> {
    // Create a new message
    const message = await MessageModel.create({
        content: content,
        sender: userID
    })
    if (!message) {
        throw new Error("Could not create message")
    }
    return formatIndividualMessages(message)
}
