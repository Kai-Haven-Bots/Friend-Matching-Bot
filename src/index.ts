import {
    Client,
    GuildBasedChannel,
    GuildTextBasedChannel,
    IntentsBitField,
    Message,
    PartialMessage
} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import {
    CHAR,
    Model,
    Op,
    STRING,
    Sequelize
} from 'sequelize';
import {
    intro_to_json
} from './AI/openAI';
import {
    message_listen
} from './events/message_create';
import {
    message_edit_listen
} from './events/message_edit';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})

export const INTRO_CHANNEL_ID = "908893077886861342";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'users.db',
    logging: false
})


const path_to_models = path.join(__dirname, 'database', 'models');

fs.readdirSync(path_to_models)
    .forEach(modelFile => {
        const model = require(path.join(path_to_models, modelFile));
        model.model(sequelize);
    })



sequelize.sync({
    alter: true
}).then(sequelize => {
    client.login(process.env._TOKEN);
    match(["movies", "games"], 5).then(s => {
        console.log(s);
    });

})


const F = IntentsBitField.Flags;
const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
    message_listen(client);
    message_edit_listen(client);
})

export const harvest_info = async (msg: Message | PartialMessage) => {
    if (!msg.content) return;
    if (!msg.author) return;
    if (msg.channelId !== INTRO_CHANNEL_ID) return;
    if (msg.author ?.bot) return;

    if (msg.channel.isThread()) return;

    const info = await intro_to_json(msg.content, msg.author ?.id);

    if (info.name === "err") return;
    if (info.name === "none") info.name = msg.author.username

    info.hobbies = (info.hobbies as string[]).join(',');
    const users_model = sequelize.model("users");

    const [model, created] = await users_model.findOrCreate({
        where: {
            userId: msg.author.id
        },
        defaults: info
    })

    if (!created) {
        model.update(info);
    }

    console.log(info);


}

export const match = async (hobbies: string[], amount: number) => {
    const users_model = sequelize.model("users");

    const matches = new Map < string,
        number > ();

    for (const hobby of hobbies) {
        const users = await users_model.findAll({
            where: {
                hobbies: {
                    [Op.like]: `%${hobby}%`
                }
            }
        })

        users.forEach(model => {
            const userId = model.get("userId") as string;

            if (matches.has(userId)) {
                matches.set(userId, matches.get(userId) as number + 1)
            } else {
                matches.set(userId, 1);
            }
        })
    }
    
    const arr_matches = [...matches];

    const sorted = arr_matches.sort((a, b) => b[1] - a[1]);
    
    const return_arr: string[] = [];

    const picked_indexes: number[] = [];

    for(let i = 0; i < amount; i++){
        if(sorted[i] === undefined) break;

        const element = sorted[i];
        let picked = element;


        let index = i;
 
        do{
            index = Math.floor(Math.random() * sorted.length);
        }while(picked_indexes.some(v => v===index))

        if(element[1] === 1){
            picked = sorted[index];            
        }

        if(!return_arr.some(v => v === picked[0])){
            return_arr.push(picked[0]);
            picked_indexes.push(i);
        }

    }

    return return_arr;
    
}

export type userData = {
    userId: string,
    name: string,
    age: number,
    gender: string,
    hobbies: string[] | string,
    emotionalState: string,
    extraInfo: string

}