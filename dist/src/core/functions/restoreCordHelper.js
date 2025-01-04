/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2025 iHorizon
*/
import * as apiUrlParser from "./apiUrlParser.js";
import { axios } from "./axios.js";
export const Oauth2_Link = 'https://discord.com/oauth2/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&state={guild_id}';
export function createRestoreCordLink(data) {
    return Oauth2_Link
        .replace("{client_id}", data.clientId)
        .replace("{guild_id}", data.guildId)
        .replace("{redirect_uri}", apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.GenerateOauthLink))
        .replace("{scope}", "identify+guilds+guilds.join");
}
export async function createRestoreCord(data) {
    return (await axios.post(apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.CreateRestoreCordGuild), data, { headers: { 'Accept': 'application/json' } })).data || {};
}
export function getGuildDataPerSecretCode(data, secretCode) {
    for (let index in data) {
        const entry = data[index];
        if (entry.value && entry.value.config && entry.value.config.securityCode === secretCode) {
            return { id: entry.id, data: entry.value };
        }
    }
    return null;
}
export async function forceJoinRestoreCord(data) {
    return (await axios.post(apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.ForceJoinRestoreCord), data, { headers: { 'Accept': 'application/json' } })).data || {};
}
export async function securityCodeUpdate(data) {
    return (await axios.post(apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.AddSecurityCodeAmount), data, { headers: { 'Accept': 'application/json' } })).data || {};
}
export async function changeRoleRestoreCord(data) {
    return (await axios.post(apiUrlParser.HorizonGateway(apiUrlParser.GatewayMethod.ChangeRole), data, { headers: { 'Accept': 'application/json' } })).data || {};
}
