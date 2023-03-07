import { Client, GuildBasedChannel, GuildTextBasedChannel, IntentsBitField} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { CHAR, STRING, Sequelize } from 'sequelize';
import { getResponse } from './AI/openAI';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


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



const messages_model = sequelize.define('messages', {
    userId: {
        type: CHAR(50)
    },
    time: {
        type: CHAR(100)
    },
    msg: {
        type: STRING
    }
})

sequelize.sync({alter: true}).then(sequelize => {
    client.login(process.env._TOKEN);
})


const F = IntentsBitField.Flags;
const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
})

getResponse(`names: ame, siege, fraudie, james, bradley, luke, felix :Hero_ExhaustedOE: 
:melody_wave: he/it :melody_sparkles: 
age: over 10 under 16
fandoms :davidswag: 
:point: 126 :fucknotagain: 
:point: arknights :DuskLove: 
:point: ddlc :yuriuwu: 
:point: omori :Spin_KelDWOE: 
:point: hotel dusk:pride_flag_mlm: 
:point: professor layton :ilovelayton: 
:point: needy streamer overload :ame_smile: 
:WThumbsUp: hobbies:WDance: 
next to none so not wasting text :IntenseGrab:
:heart_firework: Likes :heart_firework: 
:arrowblack: silly things:ame_smile: 
:arrowblack: drawing (in school):stickmanfast: 
:arrowblack: talking about 126:OMG: 
:arrowblack: carisle :TeamHarleen: 
:arrowblack: random emojis
dislikes (& phobias)
worms DO NOT MENTION NEAR ME :BlackExclaim: 
spit+saliva+mucus can tolerate
please don't reality check :icon_heart: 
bonus: I can play the guitar kinda (forgot how to do all the chords :basil_cry:)`).then(r => console.log(r.hobbies));

const scrape_messages = async (client: Client, channelId: string, messages: number) => {
 const start = Date.now();

 const channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel;

    let json = [];
    let last = "";

    let loops = messages/100;
    if(loops<1){
        console.log("messages amount must be above 100");
        return; 
    }

    let j = 0;
    for(let i = 0; i < loops; i++){
        let messages;

        if(last !== ""){
            messages = await channel.messages.fetch({before: last, limit: 100})
        }else{
            messages = await channel.messages.fetch({limit: 100});
        }

        for(let message of messages){
            let msg = message[1];
            j++
            if(msg.content !== ""){
                  const content = msg.content.replace(/['"\\;]|--|\/\*/g, "");

                 json.push({userId: msg.author.id, msg: content, time: msg.createdTimestamp});
                 console.log(`${j}. ${content} time_elapsed: ${Math.round( (Date.now() - start)/1000)} seconds`);
            }

            if(j%100 === 0){
                messages_model.bulkCreate(json);
                json = [];
            }
           
            last = message[0];
        }
        
    }

    messages_model.bulkCreate(json);
    const stop = Date.now();

    console.log(`time taken: ${stop - start} milliseconds`);
    
}

export type userData = {
    name: string, 
    age: number,
    gender: string,
    hobbies: string [],
    emotionalState: string,
    extraInfo: string
    
}









