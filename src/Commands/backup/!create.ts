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

import backup from 'discord-backup';

export = {
    run: async (client: Client, interaction: any, data: any) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.backup_not_admin });
            return;
        };

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.backup_i_dont_have_permission });
            return;
        };

        let i: number = 0;
        let j: number = 0;

        let svMsg = interaction.options.getBoolean('save-message');

        backup.create(interaction.guild, {
            maxMessagesPerChannel: svMsg ? 10 : 0,
            jsonBeautify: true
        }).then(async (backupData) => {

            await backupData.channels.categories.forEach(category => {
                i++;
                category.children.forEach(() => {
                    j++;
                });
            });

            let elData = { guildName: backupData.name, categoryCount: i, channelCount: j };

            await db.DataBaseModel({ id: db.Set, key: `BACKUPS.${interaction.user.id}.${backupData.id}`, value: elData });

            interaction.channel.send({ content: data.backup_command_work_on_creation });
            await interaction.editReply({
                content: data.backup_command_work_info_on_creation
                    .replace("${backupData.id}", backupData.id)
            });

            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.backup_logs_embed_title_on_creation)
                    .setDescription(data.backup_logs_embed_description_on_creation
                        .replace('${interaction.user.id}', interaction.user.id)
                    );

                let logchannel = interaction.guild.channels.cache.find((channel: {
                    name: string;
                }) => channel.name === 'ihorizon-logs');

                if (logchannel) {
                    logchannel.send({ embeds: [logEmbed] });
                };
            } catch (e: any) {
                logger.err(e)
            };
        });
    },
};