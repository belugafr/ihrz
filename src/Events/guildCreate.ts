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


import { Client, Guild, GuildChannel, GuildChannelManager, Message, MessageManager } from "discord.js";

import { Collection, EmbedBuilder, PermissionsBitField, AuditLogEvent, Events, GuildBan } from 'discord.js';
import * as db from '../core/functions/DatabaseModel';
import logger from "../core/logger";
import config from '../files/config';

export = async (client: any, guild: any) => {
    let channel = await guild.channels.cache.get(guild.systemChannelId)
        || await guild.channels.cache.random();

    // async function antiPoubelle() {
    //   let embed = new EmbedBuilder()
    //     .setColor("#f44336")
    //     .setTimestamp()
    //     .setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
    //     .setFooter({ text: 'iHorizon', iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }) })
    //     .setDescription(`Dear members of this server,
    // We regret to inform you that our bot will be leaving this server. We noticed that this server has less than 10 members, which may suggest that it is not an active and healthy community for our bot to be a part of.
    // We value the safety and satisfaction of our users, and we believe that being part of active and thriving communities is essential to achieving this goal. We apologize for any inconvenience this may cause and we hope to have the opportunity to serve you in a more suitable environment in the future.

    // Thank you for your understanding and have a great day.
    // Best regards,
    // iHorizon Project`);

    //   if (!guild.memberCount) {
    //     if (channel) { channel.send({ embeds: [embed] }).catch(err => { }); };
    //     await guild.leave();
    //     return false;
    //   };
    //   return true;
    // };

    async function blacklistLeave() {
        let channelHr = await guild.channels.cache.get(guild.systemChannelId)
            || await guild.channels.cache.random();

        let tqtmonreuf = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription(`Dear <@${guild.ownerId}>, I'm sorry, but you have been blacklisted by the bot.\nAs a result, I will be leaving your server. If you have any questions or concerns, please contact my developer.\n\nThank you for your understanding`)
            .setTimestamp()
            .setFooter({ text: 'iHorizon', iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }) })

        let isBL = await db.DataBaseModel({ id: db.Get, key: `GLOBAL.BLACKLIST.${guild.ownerId}.blacklisted` }) || false;

        if (isBL) {
            await channelHr.send({ embeds: [tqtmonreuf] }).catch(() => { });
            guild.leave();
            return false;
        } else {
            return true;
        };
    };

    async function messageToServer() {
        let welcomeMessage = [
            "Welcome to our server! 🎉", "Greetings, fellow Discordians! 👋",
            "iHorizon has joined the chat! 💬", "It's a bird, it's a plane, no, it's iHorizon! 🦸‍♂",
            "Let's give a warm welcome to iHorizon! 🔥",
        ];
        let embed = new EmbedBuilder()
            .setColor("#00FF00").setTimestamp()
            .setTitle(welcomeMessage[Math.floor(Math.random() * welcomeMessage.length)])
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'iHorizon', iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }) })
            .setDescription(`Hi there! I'm excited to join your server and be a part of your community. 
      
My name is iHorizon and I'm here to help you with all your needs. Feel free to use my commands and explore all the features I have to offer.

If you have any questions or run into any issues, don't hesitate to reach out to me.
I'm here to make your experience on this server the best it can be. 

Thanks for choosing me and let's have some fun together!`);

        if (channel) { channel.send({ embeds: [embed] }).catch(() => { }); };
    };

    async function getInvites() {
        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) return;
        try {
            guild.invites.fetch().then((guildInvites: { map: (arg0: (invite: any) => any[]) => Iterable<readonly [unknown, unknown]> | null | undefined; }) => {
                client.invites.set(guild.id, new Map(guildInvites.map((invite: any) => [invite.code, invite.uses])));
            })
        } catch (error: any) { logger.err(error) };
    };

    async function ownerLogs() {
        let i: string = '';
        if (guild.vanityURLCode) { i = 'discord.gg/' + guild.vanityURLCode; };

        let embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTimestamp(guild.joinedTimestamp)
            .setDescription(`**A new guild have added iHorizon !**`)
            .addFields({ name: "🏷️・Server Name", value: `\`${guild.name}\``, inline: true },
                { name: "🆔・Server ID", value: `\`${guild.id}\``, inline: true },
                { name: "🌐・Server Region", value: `\`${guild.preferredLocale}\``, inline: true },
                { name: "👤・MemberCount", value: `\`${guild.memberCount}\` members`, inline: true },
                { name: "🪝・Vanity URL", value: `\`${i || "None"}\``, inline: true })
            .setThumbnail(guild.iconURL())
            .setFooter({ text: 'iHorizon', iconURL: client.user.displayAvatarURL() });
        client.channels.cache.get(config.core.guildLogsChannelID).send({ embeds: [embed] }).catch(() => { });
    };

    // let c = await antiPoubelle();
    let d = await blacklistLeave();
    if (d) ownerLogs(), messageToServer(), getInvites();
};