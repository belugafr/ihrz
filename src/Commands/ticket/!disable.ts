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

import {
    Client,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';
import logger from '../../core/logger';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.disableticket_not_admin });
            return;
        };

        let type = interaction.options.getString('action');

        if (type === "off") {
            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.disableticket_logs_embed_title_disable)
                    .setDescription(data.disableticket_logs_embed_description_disable.replace(/\${interaction\.user\.id}/g, interaction.user.id));

                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                if (logchannel) {
                    logchannel.send({ embeds: [logEmbed] })
                }
            } catch (e: any) {
                logger.err(e)
            };

            await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.GUILD.TICKET.disable`, value: true });
            await interaction.editReply({ content: data.disableticket_command_work_disable });
            return;
        } else if (type === "on") {
            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.disableticket_logs_embed_title_enable)
                    .setDescription(data.disableticket_logs_embed_description_enable.replace(/\${interaction\.user\.id}/g, interaction.user.id));

                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                if (logchannel) {
                    logchannel.send({ embeds: [logEmbed] })
                }
            } catch (e: any) {
                logger.err(e)
            };

            await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.GUILD.TICKET.disable`, value: false });
            await interaction.editReply({ content: data.disableticket_command_work_enable });
            return;
        };
    },
};