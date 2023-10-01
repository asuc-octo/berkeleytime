import { ChatModule } from "./generated-types/module-types";
import { ChatType, MessageType } from "../../db/chat";

export function formatChatMessages(chat: ChatType): ChatModule.Message[] {
    const messages: ChatModule.Message[] = []
    chat.messages.forEach((message) => {
        messages.push({
            _id: message._id?.toString() as string,
            content: message.content,
            user: message.sender
        })
    })
    return messages
}

export function formatIndividualMessages(message: MessageType): ChatModule.Message {
    return {
        _id: message._id?.toString() as string,
        content: message.content,
        user: message.sender
    }
}