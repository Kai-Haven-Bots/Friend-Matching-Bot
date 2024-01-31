import { config } from "dotenv";
config()


export const token = process.env.TOKEN;
export const openAI_key = process.env.OPENAI_KEY;
export const intro_channelIds = process.env.INTRO_CHANNELIDS?.split(",") || ["908893077886861342", "1008752982000676894"];