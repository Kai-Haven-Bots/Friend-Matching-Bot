import { Configuration, OpenAIApi } from "OpenAI";
import * as path from 'path';
import { userData } from "../index";
import jsonlint from 'jsonlint';

require('dotenv')
    .config({
         path: path.join(__dirname, "..", ".env")
    })


const configuration = new Configuration({
    apiKey: process.env.KEY,
});
const openai = new OpenAIApi(configuration);


const prompt = `Assistant extracts name, age, pronoun, hobbies (array, simplified and shortened), emotional state and extraInfo from text. extraInfo for additional info\n`;

const training_input = `Name: Julinka 
Age: between 13 and 15
Gender: Female 
Likes: kids shows, drawing/coloring/painting, toys, cats, dogs
Hobbies: coding games, basketball, video games, guitar 
Dislikes: Bullying, racism, ageism, swearing or strong slurs, violent or romantic content, dating
Other: I have autism, ADHD, neurofibromatosis, I also suffer from anxiety and depression`;

const training_output = `{
    "name": "Julinka",
    "age": 14,
    "pronoun": "she",
    "hobbies": ["kids shows", "drawing", "toys", "cats", "dogs", "coding", "basketball", "games", "guiter"],
    "emotionalState": "anxiety, depression",
    "extraInfo": "Has autism, ADHD, neurofibromatosis"
}`

export const intro_to_json = async (text: string, userId: string): Promise<userData> => {
    let result: userData = {
        userId: userId,
        name: "none",
        age: 0,
        gender: "other",
        hobbies: [],
        emotionalState: "",
        extraInfo: ""
    };

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: prompt},
                {role: "user", content: training_input},
                {role: "system", content: training_output},
                {role: "user", content: "Hi I am Ox, I like boxing"},
                {role: "assistant", content: `{
                    "name": "Ox",
                    "age": 0,
                    "pronoun": "other",
                    "hobbies": ["boxing"],
                    "emotionalState": "",
                    "extraInfo": ""
                }`},
                {role: "user", content: `input: "${text}"`}
            ],
            temperature: 0
        });

        console.log(response.data.choices[0].message);
        const raw_result = response.data.choices[0].message?.content as string;

        const starting_index = raw_result.indexOf('{');
        const ending_index = raw_result.indexOf('}') +1;

        const json_string =  raw_result.slice(starting_index, ending_index);

        result = JSON.parse(json_string) as userData;

        if(!result.age) result.age = 0;
        if(!result.emotionalState ) result.emotionalState = "";
        if(!result.extraInfo) result.extraInfo = "";
        if(!result.gender) result.gender = "other"
        if(!result.hobbies) result.hobbies = []
        if(!result.name) result.name = "none"

        result.userId = userId;

        console.log(`name: "${result.name}" tokens: "${response.data.usage?.total_tokens}"`);
    } catch(err) {
        console.log(err);
    } finally {
        return result;
    }
}

