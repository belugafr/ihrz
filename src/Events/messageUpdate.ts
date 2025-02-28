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

import { Client, Collection, EmbedBuilder, Message, Options, Permissions, Presence } from 'discord.js';
import * as db from '../core/functions/DatabaseModel';

export = async (client: Client, oldMessage: Message, newMessage: Message) => {
    let data = await client.functions.getLanguageData(oldMessage.guild?.id)
    async function serverLogs() {
        if (!oldMessage || !oldMessage.guild) return;

        if (!newMessage.author || newMessage.author.bot
            || oldMessage.content == '' || !oldMessage.content
            || newMessage.content == '' || !newMessage.content) return;

        let someinfo = await db.DataBaseModel({ id: db.Get, key: `${oldMessage.guildId}.GUILD.SERVER_LOGS.message` });

        if (!someinfo || !oldMessage.content || !newMessage.content
            || oldMessage.content === newMessage.content) return;

        let Msgchannel: any = client.channels.cache.get(someinfo);
        if (!Msgchannel) return;

        let icon: any = newMessage.author.displayAvatarURL();

        let logsEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setAuthor({ name: newMessage.author.username, iconURL: icon })
            .setDescription(data.event_srvLogs_messageUpdate_description
                .replace("${oldMessage.channelId}", oldMessage.channelId)
            )
            .setFields({ name: data.event_srvLogs_messageUpdate_footer_1, value: oldMessage.content || '**?**' },
                { name: data.event_srvLogs_messageUpdate_footer_2, value: newMessage.content || '**?**' })
            .setTimestamp();

        await Msgchannel.send({ embeds: [logsEmbed] }).catch(() => { });
    };

    serverLogs();
};