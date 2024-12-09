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
    Client,
    EmbedBuilder,
    PermissionsBitField,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    BaseGuildTextChannel,
    ApplicationCommandType,
    Message,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    Channel,
    GuildTextBasedChannel,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType,
    TextInputStyle,
    Embed,
    RoleSelectMenuBuilder,
    StringSelectMenuInteraction,
    CacheType
} from 'discord.js'

import { Command } from '../../../../types/command.js';
import logger from '../../../core/logger.js';
import { LanguageData } from '../../../../types/languageData.js';
import { DatabaseStructure } from '../../../../types/database_structure.js';
import { iHorizonModalResolve } from '../../../core/functions/modalHelper.js';

type RoleReactData = {
    roleId: string;
    emoji: string;
    desc: string;
    label: string;
}[];

export const command: Command = {
    name: 'roleselect',
    description: 'Configure role selection for a specific message',
    description_localizations: {
        "fr": "Configurer la sélection de rôles pour un message spécifique"
    },
    aliases: ["selectreact"],
    options: [
        {
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            description: "The channel containing the target message",
            description_localizations: {
                "fr": "Le salon où se trouve le message à configurer"
            },
            channel_types: [ChannelType.GuildText],
            required: true
        },
        {
            name: 'messageid',
            type: ApplicationCommandOptionType.String,
            description: "Message ID to configure role selection",
            description_localizations: {
                "fr": "Identifiant du message à configurer pour la sélection de rôles"
            },
            required: true
        },
    ],
    category: 'rolereactions',
    thinking: false,
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, runningCommand: any, neededPerm?: number, args?: string[]) => {
        // Improved guard clauses
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) {
            return;
        }

        // Flexible channel and message ID extraction
        const channel = interaction instanceof ChatInputCommandInteraction
            ? interaction.options.getChannel("channel") as Channel
            : client.method.channel(interaction, args!, 0) as Channel;

        const messageId = interaction instanceof ChatInputCommandInteraction
            ? interaction.options.getString("messageId") as string
            : client.method.string(args!, 1) as string;

        // Validate message ID
        if (!messageId || messageId.length < 10) {
            await client.method.interactionSend(interaction, {
                content: "Invalid message ID provided."
            });
            return;
        }

        // Fetch existing role select data
        let baseData: RoleReactData = await client.db.get(`${interaction.guildId}.GUILD.ROLE_SELECT.${messageId}`) || [];

        // Main selection menu
        const selectMenuChoice = new StringSelectMenuBuilder()
            .setCustomId("roleselect_main_menu")
            .setPlaceholder("Choose an action")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Add Role Option")
                    .setValue("add")
                    .setEmoji("🔹"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Remove Role Option")
                    .setValue("remove")
                    .setEmoji("🔸"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Save Configuration")
                    .setValue("save")
                    .setEmoji("💾"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Cancel")
                    .setValue("cancel")
                    .setEmoji("🚫")
            );

        // Dynamic role selection menu
        const baseSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("roleselect_second_menu")
            .setPlaceholder("Select configured roles");

        // Prepare components and embeds
        const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenuChoice)
        ];

        const embed = new EmbedBuilder()
            .setTitle("Role Select Configuration")
            .setDescription("Configure role selection options for the specified message")
            .setColor(0x2f3136);

        // Update message with existing configurations
        function updateConfiguration(data: RoleReactData) {
            // Clear previous embed fields and menu options
            embed.setFields([]);
            baseSelectMenu.setOptions([]);

            data.forEach((item, index) => {
                // Add field to embed
                embed.addFields({
                    name: `${item.emoji} ${item.label}`,
                    value: `Role: <@&${item.roleId}>\nDescription: ${item.desc}`,
                    inline: false
                });

                // Add option to select menu
                baseSelectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(item.label)
                        .setValue(`role_${index}`)
                        .setDescription(item.desc)
                        .setEmoji(item.emoji)
                );
            });

            // Update components with base select menu if items exist
            if (data.length > 0) {
                components.push(
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(baseSelectMenu)
                );
            }
        }

        // Initial configuration update
        updateConfiguration(baseData);

        // Send initial configuration message
        const configMessage = await client.method.interactionSend(interaction, {
            embeds: [embed],
            components: components
        });

        // Component interaction collector
        const collector = configMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300_000, // 5 minutes
        });

        // Collector event handler
        collector.on("collect", async (interaction2) => {
            // Ensure only the original user can interact
            if (interaction2.user.id !== interaction.member?.user.id) {
                await interaction2.reply({
                    content: lang.help_not_for_you,
                    ephemeral: true
                });
                return;
            }

            switch (interaction2.values[0]) {
                case "add":
                    await handleAddRoleOption(interaction2);
                    break;
                case "remove":
                    await handleRemoveRoleOption(interaction2);
                    break;
                case "save":
                    await handleSaveConfiguration(interaction2);
                    break;
                case "cancel":
                    await handleCancelConfiguration(interaction2);
                    break;
            }
        });

        // Handler for adding a new role option
        async function handleAddRoleOption(interaction2: StringSelectMenuInteraction<CacheType>) {
            const modal = await iHorizonModalResolve({
                title: "Add Role Option",
                customId: "roleselect_add_fields",
                fields: [
                    {
                        label: "Emoji",
                        customId: "case_emoji",
                        style: TextInputStyle.Short,
                        placeHolder: "Select an emoji for this role option",
                        maxLength: 120,
                        minLength: 1,
                        required: true
                    },
                    {
                        label: "Option Title",
                        customId: "case_title",
                        style: TextInputStyle.Short,
                        maxLength: 50,
                        minLength: 4,
                        placeHolder: "Short title for the role option",
                        required: true
                    },
                    {
                        label: "Description",
                        customId: "case_desc",
                        maxLength: 120,
                        minLength: 8,
                        style: TextInputStyle.Paragraph,
                        placeHolder: "Describe the role option",
                        required: true
                    }
                ],
                deferUpdate: false
            }, interaction2);

            const emoji = modal?.fields.getTextInputValue("case_emoji")!;
            const label = modal?.fields.getTextInputValue("case_title")!;
            const desc = modal?.fields.getTextInputValue("case_desc")!;

            const roleSelectResponse = await modal?.reply({
                content: "Select a role for this option",
                components: [
                    new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId('role_selection')
                            .setPlaceholder("Choose a role")
                            .setMaxValues(1)
                    )
                ],
                ephemeral: true
            });

            const roleResponse = await modal?.channel?.awaitMessageComponent({
                componentType: ComponentType.RoleSelect,
                time: 60_000
            });

            if (roleResponse) {
                roleResponse.deferUpdate();
                roleSelectResponse?.delete();
                baseData.push({
                    label,
                    desc,
                    emoji,
                    roleId: roleResponse.values[0]
                });

                updateConfiguration(baseData);
                await interaction2.editReply({
                    embeds: [embed],
                    components: components
                });
            }
        }

        async function handleRemoveRoleOption(interaction2: StringSelectMenuInteraction<CacheType>) {
            if (baseData.length === 0) {
                await interaction2.reply({
                    content: "No role options to remove.",
                    ephemeral: true
                });
                return;
            }

            baseData.pop();

            if (baseData.length === 0) {
                await interaction2.update({
                    embeds: [],
                    components: [components[0]]
                });

                await interaction2.followUp({
                    content: "All role options have been removed.",
                    ephemeral: true
                });
                return;
            }

            updateConfiguration(baseData);

            await interaction2.update({
                embeds: [embed],
                components: components
            });

            await interaction2.followUp({
                content: "Last role option removed successfully.",
                ephemeral: true
            });
        }

        async function handleSaveConfiguration(interaction2: StringSelectMenuInteraction<CacheType>) {
            try {
                await client.db.set(`${interaction.guildId}.GUILD.ROLE_SELECT.${messageId}`, baseData);
                await interaction2.reply({
                    content: "Role selection configuration saved successfully!",
                    ephemeral: true
                });
                collector.stop();
            } catch (error) {
                logger.err("Failed to save role select configuration" + error);
                await interaction2.reply({
                    content: "Failed to save configuration. Please try again.",
                    ephemeral: true
                });
            }
        }

        async function handleCancelConfiguration(interaction2: StringSelectMenuInteraction<CacheType>) {
            await interaction2.reply({
                content: "Role selection configuration canceled.",
                ephemeral: true
            });
            collector.stop();
        }

        collector.on('end', async () => {
            await configMessage.edit({
                components: []
            });
        });
    },
};