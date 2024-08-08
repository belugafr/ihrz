/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import { Client, AuditLogEvent, GuildChannel, BaseGuildTextChannel } from 'discord.js'

import { BotEvent } from '../../../types/event';
import { LanguageData } from '../../../types/languageData';

export const event: BotEvent = {
    name: "channelDelete",
    run: async (client: Client, channel: GuildChannel) => {

        let data = await client.db.get(`${channel.guild.id}.PROTECTION`);

        if (!data) return;

        if (data.deletechannel && data.deletechannel.mode === 'allowlist') {

            let fetchedLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 10,
            });

            let lang = await client.func.getLanguageData(channel.guildId) as LanguageData;

            let relevantLog = fetchedLogs.entries.find(entry =>
                entry.targetId === channel.id &&
                entry.executorId !== client.user?.id &&
                entry.executorId
            );

            if (!relevantLog) {
                return;
            }

            let baseData = await client.db.get(`${channel.guild.id}.ALLOWLIST.list.${relevantLog.executorId}`);

            if (!baseData) {
                (await channel?.clone({
                    name: channel.name,
                    parent: channel.parent,
                    permissionOverwrites: channel.permissionOverwrites.cache!,
                    topic: (channel as BaseGuildTextChannel).topic!,
                    nsfw: (channel as BaseGuildTextChannel).nsfw,
                    rateLimitPerUser: (channel as BaseGuildTextChannel).rateLimitPerUser!,
                    position: channel.rawPosition,
                    reason: `Channel re-create by Protect (${relevantLog.executorId} break the rule!)`
                }) as BaseGuildTextChannel).send(lang.protection_avoid_channel_delete
                    .replace('${channel.guild.ownerId}', channel.guild.ownerId)
                    .replace('${firstEntry.executorId}', relevantLog.executorId!)
                );

                let user = channel.guild.members.cache.get(relevantLog.executorId!);

                switch (data?.['SANCTION']) {
                    case 'simply':
                        break;
                    case 'simply+derank':
                        await user?.roles.set([], "Punish").catch(() => false);
                        break;
                    case 'simply+ban':
                        user?.ban({ reason: 'Protect!' }).catch(() => { });
                        break;
                    default:
                        return;
                }
            }
        }

    },
};