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
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    Message,
    ChannelType,
    Channel,
    GuildTextBasedChannel,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType,
    TextInputStyle,
    RoleSelectMenuBuilder,
    StringSelectMenuInteraction,
    CacheType
} from 'discord.js'

import { Command } from '../../../../types/command.js';
import { LanguageData } from '../../../../types/languageData.js';
import { DatabaseStructure } from '../../../../types/database_structure.js';
import { iHorizonModalResolve } from '../../../core/functions/modalHelper.js';
import { isDiscordEmoji, isSingleEmoji } from '../../../core/functions/emojiChecker.js';

function generateSelectMenu(data: DatabaseStructure.RoleReactData, messageId: string, placeholder: string) {
    const dynamicSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`roleselect_roles%${messageId}`)
        .setPlaceholder(placeholder);

    data.forEach((item, index) => {
        const selectMenuOption = new StringSelectMenuOptionBuilder()
            .setLabel(item.label)
            .setValue(`role_${item.roleId}`);
        if (item.emoji && (isSingleEmoji(item.emoji) || isDiscordEmoji(item.emoji))) {
            selectMenuOption.setEmoji(item.emoji);
        }
        if (item.desc) {
            selectMenuOption.setDescription(item.desc);
        }
        dynamicSelectMenu.addOptions(selectMenuOption);
    });

    return dynamicSelectMenu;
}

async function getMessage(channel: GuildTextBasedChannel, messageId: string) {
    let fetchedMessage = null;
    try {
        fetchedMessage = await channel.messages.fetch(messageId);
    } catch (error) {
        fetchedMessage = null;
    }
    return fetchedMessage;
}

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
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) {
            return;
        }

        const channel = interaction instanceof ChatInputCommandInteraction
            ? interaction.options.getChannel("channel") as Channel
            : client.method.channel(interaction, args!, 0) as Channel;

        const messageId = interaction instanceof ChatInputCommandInteraction
            ? interaction.options.getString("messageid") as string
            : client.method.string(args!, 1) as string;

        // Validate message ID
        if (!messageId || messageId.length < 10) {
            await client.method.interactionSend(interaction, {
                content: "Invalid message ID provided."
            });
            return;
        }

        let fetchedMessage = await getMessage(channel as GuildTextBasedChannel, messageId);

        if (!fetchedMessage) {
            await client.method.interactionSend(interaction, {
                content: "Message not found in the specified channel."
            });
            return;
        }

        // Fetch existing role select data
        let baseData: DatabaseStructure.RoleReactData = await client.db.get(`${interaction.guildId}.GUILD.ROLE_SELECT.${messageId}`) || [];
        let placeholder = "Select configured roles";

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
                    .setLabel("Change Select Menu Placeholder")
                    .setValue("placeholder")
                    .setEmoji("🏷️"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Save and Apply Configuration")
                    .setValue("save")
                    .setEmoji("💾"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Cancel")
                    .setValue("cancel")
                    .setEmoji("🚫")
            );

        const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenuChoice)
        ];

        const embed = new EmbedBuilder()
            .setTitle("Role Select Configuration")
            .setDescription("when user select fields in the select menu, they will get the specified set role")
            .setColor(0x2f3136);

        function updateConfiguration(data: DatabaseStructure.RoleReactData) {
            embed.setFields([]);

            data.forEach((item, index) => {
                embed.addFields({
                    name: `[${item.emoji || lang.var_none}] ・ ${item.label}`,
                    value: `Role: ${interaction.guild?.roles.cache.get(item.roleId)?.toString() || lang.var_unknown}\nDescription: ${item.desc || lang.var_none}`,
                    inline: false
                });
            });

            components.length = 1;
            if (data.length > 0) {
                components.push(
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(generateSelectMenu(data, messageId, placeholder))
                );
            }
        }
        updateConfiguration(baseData);

        const configMessage = await client.method.interactionSend(interaction, {
            embeds: [embed],
            components: components
        });

        const collector = configMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300_000, // 5 minutes
            filter: (x) => {
                if (x.customId.startsWith("roleselect_roles")) {
                    x.deferUpdate();
                    return false;
                }
                return true;
            }
        });

        collector.on("collect", async (interaction2) => {
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
                case "placeholder":
                    await handlePlaceholderConfiguration(interaction2);
                    break;
            }
        });

        async function handleAddRoleOption(interaction2: StringSelectMenuInteraction<CacheType>) {
            const modal = await iHorizonModalResolve({
                title: "Add Role Option",
                customId: "roleselect_add_fields",
                fields: [
                    {
                        label: "Emoji",
                        customId: "case_emoji",
                        style: TextInputStyle.Short,
                        placeHolder: "Select an emoji for this role option (optional)",
                        maxLength: 120,
                        minLength: 1,
                        required: false
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
                        minLength: 0,
                        style: TextInputStyle.Paragraph,
                        placeHolder: "Describe the role option (optional)",
                        required: false
                    }
                ],
                deferUpdate: false
            }, interaction2);

            const emoji = modal?.fields.getTextInputValue("case_emoji")?.trim() || undefined;
            const label = modal?.fields.getTextInputValue("case_title")?.trim()!;
            const desc = modal?.fields.getTextInputValue("case_desc")?.trim() || undefined;

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
                if (baseData.find(x => x.roleId === roleResponse.values[0])) {
                    await roleResponse.reply({
                        content: "Role already exists in the configuration.",
                        ephemeral: true
                    });
                    roleSelectResponse?.delete();
                    updateConfiguration(baseData);
                    return;
                }

                const newRoleOption: DatabaseStructure.RoleReactData[number] = {
                    label,
                    roleId: roleResponse.values[0]
                };

                if (emoji && (isSingleEmoji(emoji) || isDiscordEmoji(emoji))) {
                    newRoleOption.emoji = emoji;
                }

                if (desc) newRoleOption.desc = desc;

                baseData.push(newRoleOption);

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
                collector.stop();

                let fetchedMessage = await getMessage(channel as GuildTextBasedChannel, messageId);

                fetchedMessage?.edit({
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(generateSelectMenu(baseData, messageId, placeholder))]
                });

                await interaction2.reply({
                    content: "Role selection configuration saved successfully!",
                    ephemeral: true
                });
            } catch (error) {
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

        async function handlePlaceholderConfiguration(interaction2: StringSelectMenuInteraction<CacheType>) {
            let modal2 = await iHorizonModalResolve({
                title: "Select Menu Placeholder",
                customId: "roleselect_placeholder",
                fields: [
                    {
                        label: "Placeholder",
                        customId: "placeholder",
                        style: TextInputStyle.Short,
                        placeHolder: "Select menu placeholder",
                        maxLength: 50,
                        minLength: 8,
                        required: true
                    }
                ],
                deferUpdate: true
            }, interaction2);

            placeholder = modal2?.fields.getTextInputValue("placeholder")?.trim()!;
            updateConfiguration(baseData);
            await interaction2.editReply({
                embeds: [embed],
                components: components
            });
        };

        collector.on('end', async () => {
            await configMessage.edit({
                components: []
            });
        });
    },
};