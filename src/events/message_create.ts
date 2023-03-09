import { Client, EmbedBuilder, EmbedField, Message } from "discord.js";
import { INTRO_CHANNEL_ID, harvest_info, match, sequelize } from "..";
import { intro_to_json } from "../AI/openAI";

export const message_listen = (client: Client) => {
    client.on('messageCreate', async msg => {
        harvest_info(msg);
        search(msg);
    })
}

export const search = async (msg: Message) => {
    if(!msg.content.startsWith('find friends')) return;
    const args = msg.content.replace('find friends', '').split(",").map(v => {
        if(v.startsWith(" ")) v = v.trimStart();
        if(v.endsWith(" ")) v = v.trimEnd();
        return v;
    });

    const matches = await match(args, 5);

    const users_model = sequelize.model('users');
    const embed = new EmbedBuilder()
        .setColor('Yellow');

    const fields: EmbedField[] = [];

    for(let match of matches){
        const user_model = await users_model.findOne({
            where: {
                userId: match
            }
        })

        const member = await msg.guild?.members.fetch(match);
        const hobbies = (user_model?.get("hobbies") as string).split(",").join(', ');
        fields.push({inline: false, name: member?.user.username + "#" + member?.user.discriminator, value: `hobbies: ${hobbies}`})
    }

    embed.setFields(fields);

    msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
}