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
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType
} from 'discord.js'

import { Command } from '../../../types/command';
import * as db from '../../core/functions/DatabaseModel';

export const command: Command = {
    name: 'help',
    description: 'Get a list of all the commands!',
    category: 'bot',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);
        let CONTENT = await db.DataBaseModel({ id: db.Get, key: "BOT.CONTENT" });

        let categories = [
            { name: data.help_backup_fields, value: CONTENT.backup, inline: true, description: data.help_backup_dsc, emoji: "🔁" },
            { name: data.help_bot_fields, value: CONTENT.bot, inline: true, description: data.help_bot_dsc, emoji: "🤖" },
            { name: data.help_economy_fields, value: CONTENT.economy, inline: true, description: data.help_economy_dsc, emoji: "👩‍💼" },
            { name: data.help_fun_fields, value: CONTENT.fun, inline: true, description: data.help_fun_dsc, emoji: "🆒" },
            { name: data.help_giveaway_fields, value: CONTENT.giveaway, inline: true, description: data.help_giveaway_dsc, emoji: "🎉" },
            { name: data.help_guildconf_fields, value: CONTENT.guildconfig, inline: true, description: data.help_guildconf_dsc, emoji: "⚙" },
            { name: data.help_invitem_fields, value: CONTENT.invitemanager, inline: true, description: data.help_invitem_dsc, emoji: "💾" },
            { name: data.help_memberc_fields, value: CONTENT.membercount, inline: true, description: data.help_memberc_dsc, emoji: "👥" },
            { name: data.help_mod_fields, value: CONTENT.moderation, inline: true, description: data.help_mod_dsc, emoji: "👮‍♀️" },
            { name: data.help_music_fields, value: CONTENT.music, inline: true, description: data.help_music_dsc, emoji: "🎵" },
            { name: data.help_newftrs_fields, value: CONTENT.newfeatures, inline: true, description: data.help_newftrs_dsc, emoji: "🆕" },
            { name: data.help_owner_fields, value: CONTENT.owner, inline: true, description: data.help_owner_dsc, emoji: "👩‍✈️" },
            { name: data.help_prof_fields, value: CONTENT.profil, inline: true, description: data.help_prof_dsc, emoji: "👩" },
            { name: data.help_protection_fields, value: CONTENT.protection, inline: true, description: data.help_protection_dsc, emoji: "🛡️" },
            { name: data.help_ranks_fields, value: CONTENT.ranks, inline: true, description: data.help_ranks_dsc, emoji: "🌟" },
            { name: data.help_roler_fields, value: CONTENT.rolereactions, inline: true, description: data.help_roler_dsc, emoji: "📇" },
            { name: data.help_schedule_fields, value: CONTENT.schedule, inline: true, description: data.help_schedule_dsc, emoji: "🗒" },
            { name: data.help_security_fields, value: CONTENT.security, inline: true, description: data.help_security_dsc, emoji: "🔐" },
            { name: data.help_suggestion_fields, value: CONTENT.suggestion, inline: true, description: data.help_suggestion_dsc, emoji: "❓" },
            { name: data.help_ticket_fields, value: CONTENT.ticket, inline: true, description: data.help_ticket_dsc, emoji: "🎫" },
            { name: data.help_utils_fields, value: CONTENT.utils, inline: true, description: data.help_utils_dsc, emoji: "🧰" },
        ];

        let select = new StringSelectMenuBuilder().setCustomId('starter').setPlaceholder('Make a selection!');
        categories.forEach((category, index) => { select.addOptions(new StringSelectMenuOptionBuilder().setLabel(category.name).setValue(index.toString()).setEmoji(category.emoji)); });
        let row = new ActionRowBuilder().addComponents(select);
        let pp: any = client.user?.displayAvatarURL();

        let embed = new EmbedBuilder()
            .setColor('#001eff')
            .setDescription(data.help_tip_embed)
            .setFooter({ text: 'iHorizon', iconURL: client.user?.displayAvatarURL() })
            .setThumbnail(pp)
            .setTimestamp();

        let response = await interaction.editReply({ embeds: [embed], components: [row] });
        let collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 840_000 });

        collector.on('collect', async (i: {
            member: { id: any };
            reply: (arg0: { content: string; ephemeral: boolean }) => any;
            deferUpdate: () => any;
            values: (string | number)[];
        }) => {

            if (i.member.id !== interaction.user.id) {
                await i.reply({ content: data.help_not_for_you, ephemeral: true });
                return;
            };

            await i.deferUpdate();

            embed
                .setTitle(`${categories[i.values[0] as number].emoji}・${categories[i.values[0] as number].name}`)
                .setDescription(categories[i.values[0] as number].description);

            embed.setFields({ name: ' ', value: ' ' });

            await categories[i.values[0] as number].value.forEach((element: { cmd: any; desc: any }) => {
                embed.addFields({ name: `**/${element.cmd}**`, value: `\`${element.desc}\``, inline: true });
            });

            await response.edit({ embeds: [embed] });
        });
    },
};