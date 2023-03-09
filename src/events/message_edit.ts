import { Client, Message } from "discord.js";
import { harvest_info } from "..";

export const message_edit_listen = (client: Client) => {
    client.on('messageUpdate', async (old, msg) => {
        harvest_info(msg);
    })
}

