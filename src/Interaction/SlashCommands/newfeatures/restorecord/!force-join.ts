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
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    ComponentType,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import WebSocket from 'ws';
import { forceJoinRestoreCord, getGuildDataPerSecretCode } from '../../../../core/functions/restoreCordHelper.js';
import { SubCommandArgumentValue } from '../../../../core/functions/method.js';
import { LanguageData } from '../../../../../types/languageData.js';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, command: SubCommandArgumentValue) => {
        let permCheck = await client.method.permission.checkCommandPermission(interaction, command.command!);
        if (!permCheck.allowed) return client.method.permission.sendErrorMessage(interaction, lang, permCheck.neededPerm || 0);

        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && permCheck.neededPerm === 0) {
            await interaction.reply({ content: lang.security_disable_not_admin });
            return;
        }

        const secretCode = interaction.options.getString("key")!;
        const table = client.db.table("RESTORECORD");
        const Data = getGuildDataPerSecretCode(await table.all(), secretCode);

        if (!Data) return client.method.interactionSend(interaction, {
            content: `${client.iHorizon_Emojis.icon.No_Logo} The RestoreCord module with key: **${secretCode}** doesn't exist!`,
            ephemeral: true
        });

        const members = Data.data.members || [];
        const membersAlreadyHere = Data.data.members.filter(user => {
            return interaction.guild.members.cache.has(user.id)
        });

        let embed = new EmbedBuilder()
            .setTitle("[RestoreCord] Force Join")
            .setDescription("## Are you sure to force-join member in this guild ?\n### READ CAREFULLY:\nIF YOU CONFIRM THIS ACTION, THE CURRENT PRIVATE KEY WILL BE DESTROYED. A NEW KEY WILL BE PROVIDED TO YOU.\n\n\n")
            .setColor(2829617)
            .setFields(
                { name: "Members found", value: String(members.length), inline: true },
                { name: "Members already here", value: String(membersAlreadyHere.length), inline: true },
                { name: "Possible join", value: String(members.length - membersAlreadyHere.length), inline: true },
            );

        const response = await client.method.interactionSend(interaction, {
            embeds: [embed],
            ephemeral: false,
            fetchReply: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("yes")
                            .setStyle(ButtonStyle.Danger)
                            .setLabel(lang.var_confirm),
                        new ButtonBuilder()
                            .setCustomId("no")
                            .setStyle(ButtonStyle.Success)
                            .setLabel(lang.embed_btn_cancel)
                    )
            ]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 2_240_00,
        });

        collector.on("collect", async i => {
            if (i.user.id !== interaction.member?.user.id) {
                await i.reply({ content: lang.help_not_for_you, ephemeral: true });
                return;
            }

            await i.deferUpdate();

            if (i.customId === "yes") {
                let totalMembers = Data.data.members.length;
                let addedCount = 0;
                let lastUpdateTime = Date.now();

                const updateEmbed = () => {
                    embed.setFields(
                        { name: "Possible join", value: String(totalMembers - membersAlreadyHere.length), inline: true },
                        { name: "Joined", value: String(addedCount), inline: true },
                    );
                    interaction.editReply({ embeds: [embed] });
                };

                const forceJoinMembers = Data.data.members.filter(user => {
                    return !interaction.guild.members.cache.has(user.id)
                }).map(x => x.id);

                const updateInterval = 5;
                const maxUpdateInterval = 10000;

                forceJoinRestoreCord({
                    membersToForceJoin: forceJoinMembers,
                    apiToken: client.config.api.apiToken,
                    targetGuildId: interaction.guildId,
                    guildId: Data.id,
                    secretCode
                }).then(res => {
                    let data = res.message.split("%");
                    let ws = new WebSocket(data[0]);

                    ws.on('error', console.error);

                    ws.on('open', function open() {
                        ws.send("forceJoin%" + data[1]);
                    });

                    ws.on('message', async function message(messageData) {
                        const messageParts = messageData.toString().split(":");
                        const value = messageParts[1];
                        const value2 = messageParts[2] || "";

                        switch (value) {
                            case "size":
                                embed.setDescription(`# Preparing to add **${value2}** members to the guild.`);
                                break;
                            case "start":
                                embed.setDescription(`# Force-joining in progress...`);
                                break;
                            case "add":
                                addedCount++;
                                if (Date.now() - lastUpdateTime > maxUpdateInterval || addedCount % updateInterval === 0) {
                                    updateEmbed();
                                    lastUpdateTime = Date.now();
                                }
                                break;
                            case "end":
                                embed.setDescription("# Force-joining process completed.");
                                await interaction.followUp({
                                    content: `# READ CAREFULLY\nTHERE IS THE PRIVATE CODE THAT MUST NOT BE DISCLOSED TO ANYONE. A PERSON WITH THIS CODE COULD DELETE IT, ADD MEMBERS TO THEIR SERVER... KEEP IT SOMEWHERE SAFE. iHorizon WILL NEVER GIVE IT TO YOU AGAIN:\n\`\`\`${value2}\`\`\``,
                                    ephemeral: true
                                });

                                await interaction.user.send(`# The RestoreCord code for ${interaction.guild.name}\n\`\`\`${value2}\`\`\``)
                                    .catch(() => interaction.followUp({ content: "I tried to send you the code in a private message, but you have blocked your DMs :/", ephemeral: true }))
                                    .then(() => interaction.followUp({ content: "In case you missed it, I sent you the code in a private message!", ephemeral: true }))
                                    ;
                                break;
                        }
                        updateEmbed();
                    });

                    ws.on("close", function () {
                        ws.terminate();
                    });
                });

                collector.stop();
            } else {
                await response.delete();
                collector.stop();
            }
        });

        collector.on("end", async () => {
            await interaction.editReply({ components: [] }).catch(() => false);
        });
    }
};