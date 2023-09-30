import { MessageType } from "../../db/chat";
import { ChatModule } from "./generated-types/module-types";

export function formatMessage(message: MessageType) : ChatModule.Message {
    return {
        body: message.body,
        timestamp: message.timestamp,
    }
}