/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

import { Collection, EmbedBuilder, PermissionsBitField, AuditLogEvent, Events, GuildBan, Client, BaseClient, Channel, GuildChannel, Message } from 'discord.js';
import * as db from '../core/functions/DatabaseModel';
import logger from "../core/logger";
import config from '../files/config';

export = async (client: Client, member: any) => {
    let data = await client.functions.getLanguageData(member.guild.id);

    async function memberCount() {
        try {
            let botMembers = member.guild.members.cache.filter((member: { user: { bot: any; }; }) => member.user.bot);
            let rolesCount = member.guild.roles.cache.size;

            let baseData = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.GUILD.MCOUNT` });
            let bot = baseData?.bot;
            let member_2 = baseData?.member;
            let roles = baseData?.roles;

            if (bot) {
                let joinmsgreplace = bot.name
                    .replace("{botcount}", botMembers.size);

                let Fetched = member.guild.channels.cache.get(bot.channel);
                Fetched.edit({ name: joinmsgreplace });
                return;
            } else if (member_2) {
                let joinmsgreplace = member_2.name
                    .replace("{membercount}", member.guild.memberCount);

                let Fetched = member.guild.channels.cache.get(member_2.channel);
                Fetched.edit({ name: joinmsgreplace });
                return;
            } else if (roles) {
                let joinmsgreplace = roles.name
                    .replace("{rolescount}", rolesCount);

                let Fetched = member.guild.channels.cache.get(roles.channel);
                Fetched.edit({ name: joinmsgreplace });
                return;
            };

        } catch (e) { return };
    };

    async function goodbyeMessage() {
        try {
            let base = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.USER.${member.user.id}.INVITES.BY` });
            let inviter = await client.users.fetch(base.inviter);

            let check = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.USER.${inviter.id}.INVITES` });

            if (check) {
                await db.DataBaseModel({ id: db.Sub, key: `${member.guild.id}.USER.${inviter.id}.INVITES.invites`, values: 1 });
                await db.DataBaseModel({ id: db.Add, key: `${member.guild.id}.USER.${inviter.id}.INVITES.leaves`, values: 1 });
            };

            var invitesAmount = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.USER.${inviter.id}.INVITES.invites` });
            var lChan: string = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.GUILD.GUILD_CONFIG.leave` });
            if (!lChan || !client.channels.cache.get(lChan)) return;

            let joinMessage = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.GUILD.GUILD_CONFIG.leavemessage` });
            if (!joinMessage) {
                let lChanManager: any = client.channels.cache.get(lChan)
                return lChanManager.send({
                    content: data.event_goodbye_inviter
                        .replace("${member.id}", member.id)
                        .replace("${member.guild.name}", member.guild.name)
                        .replace("${inviter.tag}", inviter.username)
                        .replace("${fetched}", invitesAmount)
                });
            };

            var joinMessageFormated = joinMessage
                .replace("{user}", member.user.username)
                .replace("{guild}", member.guild.name)
                .replace("{membercount}", member.guild.memberCount)
                .replace("{inviter}", inviter.username)
                .replace("{invites}", invitesAmount);

            let lChanManager: any = client.channels.cache.get(lChan)
            lChanManager.send({ content: joinMessageFormated }).catch(() => { });
        } catch (e) {
            let lChan = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.GUILD.GUILD_CONFIG.leave` });
            if (!lChan || !client.channels.cache.get(lChan)) return;
            let lChanManager: any = client.channels.cache.get(lChan)

            await lChanManager.send({
                content: data.event_goodbye_default
                    .replace("${member.id}", member.id)
                    .replace("${member.guild.name}", member.guild.name)
            }).catch(() => { });
            return;
        }
    };

    async function serverLogs() {
        if (!member.guild) return;
        if (!member.guild.members.me) return;
        if (!member.guild.members.me.permissions.has([PermissionsBitField.Flags.ViewAuditLog])) return;

        let fetchedLogs = await member.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberKick,
            limit: 1,
        });

        let firstEntry = fetchedLogs.entries.first();
        if (!firstEntry || !firstEntry.target || member.id !== firstEntry.target.id) return;

        let someinfo = await db.DataBaseModel({ id: db.Get, key: `${member.guild.id}.GUILD.SERVER_LOGS.moderation` });
        if (!someinfo) return;

        let Msgchannel: any = client.channels.cache.get(someinfo);
        if (!Msgchannel) return;

        let logsEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setDescription(data.event_srvLogs_guildMemberRemove_description
                .replace("${firstEntry.executor.id}", firstEntry.executor.id)
                .replace("${firstEntry.target.id}", firstEntry.target.id)
            )
            .setTimestamp();

        await Msgchannel.send({ embeds: [logsEmbed] }).catch(() => { });
    };

    goodbyeMessage(), serverLogs(), memberCount();
};