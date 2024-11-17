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

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionsBitField,
    RoleSelectMenuBuilder,
    RoleSelectMenuInteraction,
    ComponentType,
    Role,
    PermissionFlagsBits,
    Message,
    BaseGuildTextChannel,
    ChannelSelectMenuBuilder
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData';
import { DatabaseStructure } from '../../../../types/database_structure.js';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, command: Option | Command | undefined, neededPerm: number, args?: string[]) => {

        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

        if ((!interaction.member.permissions?.has(PermissionsBitField.Flags.Administrator) && neededPerm === 0)) {
            await client.method.interactionSend(interaction, { content: lang.setjoinroles_not_admin });
            return;
        }

        let all_channels: DatabaseStructure.UtilsData["picOnly"] = await client.db.get(`${interaction.guildId}.UTILS.picOnly`) || [];

        let embed = new EmbedBuilder()
            .setTitle(lang.utils_pic_only_embed_title)
            .setColor("#475387")
            .setDescription(lang.utils_pic_only_emnbed_desc)
            .addFields({
                name: lang.joinghostping_add_ok_embed_fields_name,
                value: Array.isArray(all_channels) && all_channels.length > 0
                    ? all_channels.map(x => `<#${x}>`).join(', ')
                    : lang.setjoinroles_var_none
            });

        let channelSelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('utils-picOnly-role-selecter')
            .setMaxValues(25)
            .setMinValues(0);

        if (all_channels !== undefined && all_channels?.length > 1) {
            const channels: string[] = Array.isArray(all_channels) ? all_channels : [all_channels];
            channelSelectMenu.setDefaultChannels(channels);
        }

        let saveButton = new ButtonBuilder()
            .setCustomId('utils-picOnly-save-button')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('💾');

        let comp = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenu);
        let comp_2 = new ActionRowBuilder<ButtonBuilder>().addComponents(saveButton);

        let og_response = await client.method.interactionSend(interaction, {
            embeds: [embed],
            components: [comp, comp_2]
        });

        const collector = og_response.createMessageComponentCollector({
            componentType: ComponentType.ChannelSelect,
            time: 240_000,
            filter: (i) => i.user.id === interaction.member?.user.id
        });

        const buttonCollector = og_response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 240_000,
            filter: (i) => i.user.id === interaction.member?.user.id
        });

        collector.on('collect', async (channelInteraction) => {
            all_channels = channelInteraction.values;

            if (!channelInteraction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
                await channelInteraction.deferUpdate();
                await client.method.interactionSend(interaction, { content: lang.setjoinroles_var_perm_issue, ephemeral: true });
                return;
            }


            await channelInteraction.deferUpdate();
            updateEmbed(embed, all_channels, lang);
            await og_response.edit({ embeds: [embed] });
        });

        buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            await buttonInteraction.deferUpdate();
            if (buttonInteraction.customId === 'utils-picOnly-save-button') {
                let newComp_2 = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        saveButton
                            .setStyle(ButtonStyle.Success)
                            .setEmoji(client.iHorizon_Emojis.icon.Yes_Logo)
                            .setDisabled(true)
                    );

                await og_response.edit({ components: [newComp_2] });

                await client.db.set(`${interaction.guildId}.UTILS.picOnly`, all_channels);
                collector.stop();
                buttonCollector.stop();
            }
        });

        collector.on('end', async () => {
            comp.components.forEach(x => {
                x.setDisabled(true)
            });

            comp_2.components.forEach(x => {
                x.setDisabled(true);
            })

            await og_response.edit({ components: [comp, comp_2] });
        });

        function updateEmbed(embed: EmbedBuilder, roles: string[], lang: LanguageData) {
            const chanValues = roles.map(role => `<#${role}>`).join(', ') || lang.setjoinroles_var_none;
            embed.setFields({
                name: lang.joinghostping_add_ok_embed_fields_name,
                value: chanValues
            });
        };
    },
};