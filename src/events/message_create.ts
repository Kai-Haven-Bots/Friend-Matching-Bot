import { Client, Message } from "discord.js";
import { INTRO_CHANNEL_ID, harvest_info, sequelize } from "..";
import { intro_to_json } from "../AI/openAI";

export const message_listen = (client: Client) => {
    client.on('messageCreate', async msg => {
        harvest_info(msg);

    })
}

