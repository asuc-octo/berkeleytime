import { ChatModule } from "./generated-types/module-types";
import { MessageType } from "../../db/message"

export function formatMessage(message: MessageType): ChatModule.Message {
    return {
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp
    };
}