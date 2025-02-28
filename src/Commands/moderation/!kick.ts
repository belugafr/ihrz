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

import logger from '../../core/logger';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let member = interaction.options.getMember("member");
        let permission = interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers]);

        if (!permission) {
            await interaction.editReply({ content: data.kick_not_permission });
            return;
        };

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.KickMembers])) {
            await interaction.editReply({ content: data.kick_dont_have_permission });
            return;
        };

        if (member.user.id === interaction.member.id) {
            await interaction.editReply({ content: data.kick_attempt_kick_your_self });
            return;
        };

        if (interaction.member.roles.highest.position < member.roles.highest.position) {
            await interaction.editReply({ content: data.kick_attempt_kick_higter_member });
            return;
        };

        member.send({
            content: data.kick_message_to_the_banned_member
                .replace(/\${interaction\.guild\.name}/g, interaction.guild.name)
                .replace(/\${interaction\.member\.user\.username}/g, interaction.member.user.globalName)
        }).catch(() => { });

        try {
            await member.kick({ reason: 'kicked by ' + interaction.user.globalName });

            let logEmbed = new EmbedBuilder()
                .setColor("#bf0bb9")
                .setTitle(data.kick_logs_embed_title)
                .setDescription(data.kick_logs_embed_description
                    .replace(/\${member\.user}/g, member.user)
                    .replace(/\${interaction\.user\.id}/g, interaction.user.id)
                );

            let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
            
            if (logchannel) {
                logchannel.send({ embeds: [logEmbed] })
            };

            await interaction.editReply({
                content: data.kick_command_work
                    .replace(/\${member\.user}/g, member.user)
                    .replace(/\${interaction\.user}/g, interaction.user)
            });
        } catch (e: any) {
            logger.err(e);
        };
    },
};