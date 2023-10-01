import { formatMessage } from "./formatter";
import { MessageModel } from "../../db/chatapp";
import { Message } from "../../generated-types/graphql";

/**
 * Fetches all messages sent by a user from mongodb and formats them into Message objects using formatMessage()
 * @param {string} user - the email of the sender
 * @returns {Promise<Message[]>} - an array with all messages sent by the user
 */
export async function getAllMessagesByUser(user: string): Promise<Message[]> {
    const userMessages = await MessageModel.find({sender: user})
    if (userMessages.length == 0) {
      throw new Error("No messages found for this user")
    }
    return userMessages.map(formatMessage)
}

/**
 * Fetches all messages sent and formats them into Message objects using formatMessage()
 * @returns {Promise<Message[]>} - an array with all the messages
 */
export async function getAllMessages(): Promise<Message[]> {
    const allMessages = await MessageModel.find({})
    if (allMessages.length == 0) {
      throw new Error("No messages found")
    }
    return allMessages.map(formatMessage)
}

/**
 * Sends a message from sender to receiver
 * @param {string} sender - the email of the sender
 * @param {string} receiver - the email of the receiver
 * @param {string} message - the contents of the message
 * @returns {Promise<Message[]>} - the message sent
 */
export async function sendNewMessage(sender: string, receiver: string, message: string): Promise<Message> {
    const newSchedule = await MessageModel.create({sender: sender, receiver: receiver, message: message})
    return formatMessage(newSchedule)
}