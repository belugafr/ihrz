import * as apiUrlParser from "./apiUrlParser.js";
import { axios } from "./axios.js";

export const Oauth2_Link = 'https://discord.com/oauth2/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=identify+guilds+guilds.join&state={guild_id}'

// {client_id}: id of the app/bot, 
// {redirect_uri}: URL OF HORIZON GATEWAY, 
// {guild_id}: id of the verified guild, 

export interface RestoreCord_EntryType {
    guildId: string;
    clientId?: string;
    apiToken?: string;
    roleId?: string;
}

export interface RestoreCord_ResponseType {
    status: "OK" | "ERR";
    message: string;
    secretCode?: string;
}

export function createRestoreCordLink(data: RestoreCord_EntryType): string {
    return Oauth2_Link
        .replace("{client_id}", data.clientId!)
        .replace("{guild_id}", data.guildId)
        .replace("{redirect_uri}", apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.GenerateOauthLink))
}
export async function createRestoreCord(data: RestoreCord_EntryType): Promise<RestoreCord_ResponseType> {
    return (await axios.post(apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.CreateRestoreCordGuild),
        data,
        { headers: { 'Accept': 'application/json' } }
    )).data || {}
}