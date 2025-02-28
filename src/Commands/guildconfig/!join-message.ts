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

export = {
    run: async (client: Client, interaction: any, data: any) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.setjoinmessage_not_admin });
            return;
        };

        let type = interaction.options.getString("value");
        let messagei = interaction.options.getString("message");

        let help_embed = new EmbedBuilder()
            .setColor("#0014a8")
            .setTitle(data.setjoinmessage_help_embed_title)
            .setDescription(data.setjoinmessage_help_embed_description)
            .addFields({
                name: data.setjoinmessage_help_embed_fields_name,
                value: data.setjoinmessage_help_embed_fields_value
            });

        if (type == "on") {
            if (messagei) {
                let joinmsgreplace = messagei
                    .replaceAll("{user}", "{user}")
                    .replaceAll("{guild}", "{guild}")
                    .replaceAll("{createdat}", "{createdat}")
                    .replaceAll("{membercount}", "{membercount}")
                    .replaceAll("\\n", '\n')

                await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.GUILD.GUILD_CONFIG.joinmessage`, value: joinmsgreplace });

                try {
                    let logEmbed = new EmbedBuilder()
                        .setColor("#bf0bb9")
                        .setTitle(data.setjoinmessage_logs_embed_title_on_enable)
                        .setDescription(data.setjoinmessage_logs_embed_description_on_enable
                            .replace("${interaction.user.id}", interaction.user.id)
                        )

                    let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
                    if (logchannel) {
                        logchannel.send({ embeds: [logEmbed] })
                    }
                } catch (e) {
                };

                await interaction.editReply({ content: data.setjoinmessage_command_work_on_enable });
                return;
            }
        } else if (type == "off") {
            await db.DataBaseModel({ id: db.Delete, key: `${interaction.guild.id}.GUILD.GUILD_CONFIG.joinmessage` });
            try {
                let logEmbed = new EmbedBuilder()
                    .setColor("#bf0bb9")
                    .setTitle(data.setjoinmessage_logs_embed_title_on_disable)
                    .setDescription(data.setjoinmessage_logs_embed_description_on_disable
                        .replace("${interaction.user.id}", interaction.user.id)
                    );

                let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');

                if (logchannel) {
                    logchannel.send({ embeds: [logEmbed] })
                };
            } catch (e) {
            };

            await interaction.editReply({ content: data.setjoinmessage_command_work_on_disable });
            return;
        } else if (type == "ls") {
            var ls = await db.DataBaseModel({ id: db.Get, key: `${interaction.guild.id}.GUILD.GUILD_CONFIG.joinmessage` });

            let embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.globalName, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('#1481c1')
                .setDescription(ls || 'None')
                .setTimestamp()
                .setTitle(data.setjoinmessage_command_work_ls)
                .setFooter({ text: 'iHorizon', iconURL: client.user?.displayAvatarURL() })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

            await interaction.editReply({
                embeds: [embed]
            });
            return;
        };

        if (!messagei) {
            await interaction.editReply({ embeds: [help_embed] });
            return;
        };
    },
};