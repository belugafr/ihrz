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
    BaseGuildTextChannel,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    Client,
    Component,
    ComponentType,
    EmbedBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextInputStyle,
} from 'discord.js';

import { TicketReOpen } from '../../../core/modules/ticketsManager.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';
import { generatePassword } from '../../../core/functions/random.js';
import { iHorizonModalResolve } from '../../../core/functions/modalHelper.js';

export interface TicketPanel {
    panelCode: string;
    relatedEmbedId: string;

    config: {
        rolesToPing: string[];
        optionFields: {
            name: string;
            desc?: string;
            value: string;
            emoji?: string;
        }[];
        pingUser: boolean;
        form: {
            questionId: number;
            questionTitle: string;
            questionPlaceholder?: string;
        }[];
    }
};

export function stringifyTicketPanelOption(fields: TicketPanel["config"]["optionFields"]): string | undefined {
    if (!fields || fields?.length === 0) return undefined;
    let i = 0;
    let _ = "```\n";

    for (let field of fields) {
        _ += `${i++} - ${field.name}\n`
        field.desc ? (_ += `  ┖  ${field.desc}\n`) : null;
        field.emoji ? (_ += `  ┖  ${field.emoji}\n`) : null;
        _ += "\n"
    }
    return _ + "```";
}

export function stringifyTicketPanelForm(fields: TicketPanel["config"]["form"]): string | undefined {
    if (!fields || fields?.length === 0) return undefined;
    let _ = "```\n";
    let i = 0;

    for (let field of fields) {
        _ += `${i++} - ${field.questionTitle}\n`
        field.questionPlaceholder ? (_ += `  ┖  ${field.questionPlaceholder}\n`) : null;
        _ += "\n"
    }
    return _ + "```";
}

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, command: Option | Command | undefined, neededPerm: number) => {


        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        if (await client.db.get(`${interaction.guildId}.GUILD.TICKET.disable`)) {
            await interaction.editReply({ content: lang.open_disabled_command });
            return;
        };

        // check admin perm

        // check panel id
        let panel_id = interaction.options.getString("panel_id");

        // get panel data or initialize it
        let baseData: TicketPanel = await client.db.get(`${interaction.guildId}.GUILD.TICKET_PANEL.${panel_id}`) || {
            panelCode: generatePassword({ length: 10, uppercase: true, numbers: true }),
            relatedEmbedId: null,

            config: {
                rolesToPing: [],
                optionFields: [],
                pingUser: true,
                form: []
            }
        };

        panel_id = baseData.panelCode;

        let is_saved = false;

        let panelEmbed = new EmbedBuilder()
            .setTitle("Ticket Panel #" + panel_id)
            .setDescription("Customize a ticket embed with specific options.")
            .setFields(
                {
                    name: "💾 Saved Configuration",
                    value: is_saved ? "🟢" : "🔴",
                    inline: true
                },
                {
                    name: "🕸️ Related embed",
                    value: baseData.relatedEmbedId || lang.var_no_set,
                    inline: true
                },
                {
                    name: "📌 Role to ping",
                    value: baseData.config.rolesToPing.length >= 1 ? baseData.config.rolesToPing.map(x => `<@&${x}>`).join("") : lang.var_no_set,
                    inline: true
                },
                {
                    name: "📎 Ping user",
                    value: baseData.config.pingUser ? "🟢" : "🔴",
                    inline: true
                },
                {
                    name: "📔 Option Fields",
                    value: stringifyTicketPanelOption(baseData.config.optionFields) || lang.var_no_set,
                    inline: false
                },
                {
                    name: "📝 Form",
                    value: stringifyTicketPanelForm(baseData.config.form) || lang.var_no_set,
                    inline: false
                },
            )
            ;

        let panelSelect = new StringSelectMenuBuilder()
            .setCustomId("panelSelect")
            .setPlaceholder("Choose options")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Save current configuration")
                    .setValue("save"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Show preview")
                    .setValue("preview"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Change current related embed")
                    .setValue("change_embed"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Add/remove role to ping")
                    .setValue("change_role"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Change ping user")
                    .setValue("change_ping"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Add/Remove Option Fields")
                    .setValue("change_option"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Modify form")
                    .setValue("change_form")
            );

        const originalResponse = await client.method.interactionSend(interaction, {
            embeds: [panelEmbed],
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
            ]
        });

        const collector = originalResponse.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 1_250_000,
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ ephemeral: true, content: "This interaction is not for you" });
            };

            let choice = i.values[0];

            switch (choice) {
                case "save":
                    i.deferUpdate();
                    await save();
                    collector.stop("legitEnd");
                    break;
                case "change_embed":
                    change_embed(i);
                    break;
                case "change_role":
                    i.deferUpdate();
                    await change_role();
                    break;
                case "change_ping":
                    i.deferUpdate();
                    await change_ping();
                    break;
                case "change_option":
                    i.deferUpdate();
                    await change_option();
                    break;
                case "change_form":
                    i.deferUpdate();
                    await change_form();
                    break;
                case "preview":
                    await preview(i);
                    break;
            }
        });

        async function save() {
            await client.db.set(`${interaction.guildId}.GUILD.TICKET_PANEL.${panel_id}`, baseData);

            panelEmbed.data.fields![0].value = "🟢";
            is_saved = true;

            await originalResponse.edit({
                embeds: [panelEmbed],
                content: "Configuration saved successfully",
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("saved")
                            .setStyle(ButtonStyle.Success)
                            .setEmoji(client.iHorizon_Emojis.icon.Yes_Logo)
                            .setDisabled(true)
                    )
                ]
            });
        }

        async function change_role() {
            let roleSelect = new RoleSelectMenuBuilder()
                .setPlaceholder("Select a role")
                .setCustomId("change_role")
                .setMaxValues(10)
                .setMinValues(0)
                .addDefaultRoles(baseData.config.rolesToPing)
                ;

            const change_role_interaction = await originalResponse.edit({
                components: [
                    new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents(
                            roleSelect
                        )
                ],
                embeds: [],
                content: "Select a role to change the role that will be pinged"
            });

            // collector for role select
            const roleCollector = change_role_interaction.createMessageComponentCollector({
                componentType: ComponentType.RoleSelect,
                time: 60_000,
            });

            roleCollector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ ephemeral: true, content: "This interaction is not for you" });
                };

                baseData.config.rolesToPing = i.values;
                is_saved = false;
                panelEmbed.data.fields![0].value = "🔴";

                // modify the panelEmbed to show the new role
                panelEmbed.data.fields![2].value = baseData.config.rolesToPing.length >= 1 ? baseData.config.rolesToPing.map(x => `<@&${x}>`).join("") : lang.var_no_set;

                // send the new panelEmbed
                originalResponse.edit({
                    embeds: [panelEmbed],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    content: null
                });

                await i.deferUpdate();
                roleCollector.stop("legitEnd");
            });

            roleCollector.on("end", async (_, reason) => {
                if (reason === "legitEnd") return;

                await change_role_interaction.edit({
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    embeds: [panelEmbed]
                });
            });
        }

        async function change_ping() {
            baseData.config.pingUser = !baseData.config.pingUser;
            is_saved = false;
            panelEmbed.data.fields![0].value = "🔴";

            panelEmbed.data.fields![3].value = baseData.config.pingUser ? "🟢" : "🔴";

            await originalResponse.edit({
                embeds: [panelEmbed],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                ]
            });
        }

        async function change_embed(i: StringSelectMenuInteraction<CacheType>) {
            let modal = await iHorizonModalResolve({
                customId: "change_embed",
                deferUpdate: false,
                title: "Change related embed",
                fields: [
                    {
                        customId: "embed_id",
                        label: "Embed ID",
                        style: TextInputStyle.Short,
                        required: true,
                        maxLength: 20,
                        minLength: 0
                    }
                ]
            }, i);

            if (!modal) return;

            // get the embed id
            let embed_id = modal.fields.getTextInputValue("embed_id");

            // check if the embed exists
            let embed = await client.db.get(`EMBED.${embed_id}`);

            if (!embed) {
                return modal.reply({ ephemeral: true, content: "The embed does not exist" });
            }

            baseData.relatedEmbedId = embed_id;
            is_saved = false;
            panelEmbed.data.fields![0].value = "🔴";

            panelEmbed.data.fields![1].value = baseData.relatedEmbedId;
            modal.deferUpdate();

            await originalResponse.edit({
                embeds: [panelEmbed],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                ]
            });

        }

        async function change_option() {
            let select = new StringSelectMenuBuilder()
                .setCustomId("change_option")
                .setPlaceholder("Choose an option")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Add option field")
                        .setValue("add"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Remove option field")
                        .setValue("remove"),
                );

            const select_interaction = await originalResponse.edit({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
                ],
                embeds: [],
                content: "Select an option to add or remove option fields"
            });

            // collector for string select
            const select_collector = select_interaction.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000,
            });

            select_collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ ephemeral: true, content: "This interaction is not for you" });
                };

                let choice = i.values[0];

                switch (choice) {
                    case "add":
                        await add_option(i);
                        select_collector.stop("legitEnd");
                        break;
                    case "remove":
                        i.deferUpdate();
                        await remove_option();
                        select_collector.stop("legitEnd");
                        break;
                }

            });

            select_collector.on("end", async (_, reason) => {
                if (reason === "legitEnd") return;

                await select_interaction.edit({
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    embeds: [panelEmbed]
                });
            });
        }

        async function add_option(i: StringSelectMenuInteraction<CacheType>) {
            let modal = await iHorizonModalResolve({
                customId: "add_option",
                deferUpdate: false,
                title: "Add option field",
                fields: [
                    {
                        customId: "name",
                        label: "Name",
                        style: TextInputStyle.Short,
                        required: true,
                        maxLength: 128,
                        minLength: 10
                    },
                    {
                        customId: "desc",
                        label: "Description",
                        style: TextInputStyle.Short,
                        required: false,
                        maxLength: 130,
                        minLength: 10
                    },
                    {
                        customId: "emoji",
                        label: "Emoji",
                        style: TextInputStyle.Short,
                        required: false,
                        maxLength: 1000,
                        minLength: 1
                    }
                ]
            }, i);

            if (!modal) return;

            let name = modal.fields.getTextInputValue("name");
            let desc = modal.fields.getTextInputValue("desc");
            let emoji = modal.fields.getTextInputValue("emoji");

            baseData.config.optionFields.push({
                name,
                desc,
                emoji,
                value: (baseData.config.optionFields.length - 1).toString()
            });

            is_saved = false;
            panelEmbed.data.fields![0].value = "🔴";

            panelEmbed.data.fields![4].value = stringifyTicketPanelOption(baseData.config.optionFields) || lang.var_no_set;

            modal.deferUpdate();

            await originalResponse.edit({
                embeds: [panelEmbed],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                ]
            });
        }

        async function remove_option() {
            let select = new StringSelectMenuBuilder()
                .setCustomId("remove_option")
                .setPlaceholder("Choose an option to remove")
                .addOptions(
                    ...baseData.config.optionFields.map((x, i) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(x.name)
                            .setValue(i.toString())
                    })
                );

            const select_interaction = await originalResponse.edit({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
                ],
                embeds: [],
                content: "Select an option to remove"
            });

            // collector for string select
            const select_collector = select_interaction.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000,
            });

            select_collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ ephemeral: true, content: "This interaction is not for you" });
                };

                let choice = i.values[0];
                baseData.config.optionFields.splice(parseInt(choice), 1);

                is_saved = false;
                panelEmbed.data.fields![0].value = "🔴";

                panelEmbed.data.fields![4].value = stringifyTicketPanelOption(baseData.config.optionFields) || lang.var_no_set;

                await i.deferUpdate();

                await originalResponse.edit({
                    embeds: [panelEmbed],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    content: null
                });

                select_collector.stop("legitEnd");
            });

            select_collector.on("end", async (_, reason) => {
                if (reason === "legitEnd") return;

                await select_interaction.edit({
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    embeds: [panelEmbed]
                });
            })
        };

        async function change_form() {
            let select = new StringSelectMenuBuilder()
                .setCustomId("change_form")
                .setPlaceholder("Choose an option")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Add form field")
                        .setValue("add"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Remove form field")
                        .setValue("remove"),
                );

            const select_interaction = await originalResponse.edit({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
                ],
                embeds: [],
                content: "Select an option to add or remove form fields"
            });

            // collector for string select
            const select_collector = select_interaction.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000,
            });

            select_collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ ephemeral: true, content: "This interaction is not for you" });
                };

                let choice = i.values[0];

                switch (choice) {
                    case "add":
                        await add_form(i);
                        select_collector.stop("legitEnd");
                        break;
                    case "remove":
                        i.deferUpdate();
                        await remove_form();
                        select_collector.stop("legitEnd");
                        break;
                }

            });

            select_collector.on("end", async (_, reason) => {
                if (reason === "legitEnd") return;

                await select_interaction.edit({
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    embeds: [panelEmbed]
                });
            });
        }

        async function add_form(i: StringSelectMenuInteraction<CacheType>) {
            let modal = await iHorizonModalResolve({
                customId: "add_form",
                deferUpdate: false,
                title: "Add form field",
                fields: [
                    {
                        customId: "questionTitle",
                        label: "Question Title",
                        style: TextInputStyle.Short,
                        required: true,
                        maxLength: 128,
                        minLength: 10
                    },
                    {
                        customId: "questionPlaceholder",
                        label: "Question Placeholder",
                        style: TextInputStyle.Short,
                        required: false,
                        maxLength: 130,
                        minLength: 10
                    }
                ]
            }, i);

            if (!modal) return;

            let questionTitle = modal.fields.getTextInputValue("questionTitle");
            let questionPlaceholder = modal.fields.getTextInputValue("questionPlaceholder");

            baseData.config.form.push({
                questionId: baseData.config.form.length,
                questionTitle,
                questionPlaceholder
            });

            is_saved = false;
            panelEmbed.data.fields![0].value = "🔴";

            panelEmbed.data.fields![5].value = stringifyTicketPanelForm(baseData.config.form) || lang.var_no_set;

            modal.deferUpdate();

            await originalResponse.edit({
                embeds: [panelEmbed],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                ]
            });
        }

        async function remove_form() {
            let select = new StringSelectMenuBuilder()
                .setCustomId("remove_form")
                .setPlaceholder("Choose an option to remove")
                .addOptions(
                    ...baseData.config.form.map((x, i) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(x.questionTitle)
                            .setValue(i.toString())
                    })
                );

            const select_interaction = await originalResponse.edit({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
                ],
                embeds: [],
                content: "Select an option to remove"
            });

            // collector for string select
            const select_collector = select_interaction.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000,
            });

            select_collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ ephemeral: true, content: "This interaction is not for you" });
                };

                let choice = i.values[0];
                baseData.config.form.splice(parseInt(choice), 1);

                is_saved = false;
                panelEmbed.data.fields![0].value = "🔴";

                panelEmbed.data.fields![5].value = stringifyTicketPanelForm(baseData.config.form) || lang.var_no_set;

                await i.deferUpdate();

                await originalResponse.edit({
                    embeds: [panelEmbed],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    content: null
                });

                select_collector.stop("legitEnd");
            });

            select_collector.on("end", async (_, reason) => {
                if (reason === "legitEnd") return;

                await select_interaction.edit({
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(panelSelect)
                    ],
                    embeds: [panelEmbed]
                });
            })
        }

        async function preview(i: StringSelectMenuInteraction<CacheType>) {
            let relatedEmbed = await client.db.get(`EMBED.${baseData.relatedEmbedId}`);

            if (!relatedEmbed || !relatedEmbed.embedSource) {
                return i.reply({ ephemeral: true, content: "The related embed does not exist" });
            }

            let embed = EmbedBuilder.from(relatedEmbed.embedSource);

            let selectMenu = new StringSelectMenuBuilder()
                .setCustomId("ticket_option")
                .setPlaceholder("Choose an option")
                .addOptions(
                    baseData.config.optionFields.map(x => {
                        const optionBuilder = new StringSelectMenuOptionBuilder()
                            .setLabel(x.name)
                            .setValue(x.value);

                        if (x.desc) {
                            optionBuilder.setDescription(x.desc);
                        }

                        if (x.emoji) {
                            optionBuilder.setEmoji(x.emoji);
                        }

                        return optionBuilder;
                    })
                );

            i.reply({
                embeds: [embed],
                content: "Preview of the ticket panel",
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)
                ],
                ephemeral: true
            })
        }

        collector.on("end", async (_, reason) => {
            if (reason === "legitEnd") return;

            await originalResponse.edit({
                components: [],
                embeds: [panelEmbed]
            });
        });
    },
};