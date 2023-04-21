import { Client, EmbedBuilder, EmbedField, Message } from "discord.js";
import { INTRO_CHANNEL_ID, harvest_info, match, sequelize } from "..";

export const message_listen = (client: Client) => {
    client.on('messageCreate', async msg => {
        harvest_info(msg);
        search(msg);
    })

    client.on('threadCreate', async thread => {
        const msg = await thread.fetchStarterMessage();
        if(msg === null) return;
        harvest_info(msg);
    })
}

export const search = async (msg: Message) => {
    const content = msg.content.toLowerCase();

    if(!content.startsWith('find friends')) return;
    const args = content.replace('find friends', '').split(",").map(v => {
        if(v.startsWith(" ")) v = v.trimStart();
        if(v.endsWith(" ")) v = v.trimEnd();
        return v;
    });

    const argsEmbed = new EmbedBuilder();
    if(args.length === 0){
        argsEmbed.setDescription('# please mention at least one hobby')
        msg.reply({embeds: [argsEmbed], allowedMentions: {repliedUser: false}});
        return;
    }

    const matches = await match(args, 5);

   
    const users_model = sequelize.model('users');
    const embed = new EmbedBuilder()
        .setColor('Yellow');

    if(matches.length === 0){
        embed.setDescription('# no one found with that hobby!')
        msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
        return;
    }

    const fields: EmbedField[] = [];

    for(let match of matches){
        const user_model = await users_model.findOne({
            where: {
                userId: match
            }
        })

        const user = await msg.client.users.fetch(match);
        const hobbies = (user_model?.get("hobbies") as string).split(",").join(', ');
        fields.push({inline: false, name:  user.username + "#" + user.discriminator, value: `hobbies: ${hobbies}`})
    }

    embed.setFields(fields);

    msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
}