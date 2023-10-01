import { ChatappModule } from "./generated-types/module-types";
import { MessageType } from "../../db/chatapp";

/**
 * Reformats a mongodb message to a graphql message
 * @param {MessageType} message - a message fetched from mongodb
 * @returns {ChatappModule.Message} - the same message as a graphql message
 */
export function formatMessage(message: MessageType): ChatappModule.Message {
    return {
        sender: message.sender as string,
        receiver: message.receiver as string,
        message: message.message as string
    };
}