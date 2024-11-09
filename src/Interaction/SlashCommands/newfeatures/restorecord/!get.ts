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
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import { LanguageData } from '../../../../../types/languageData';
import { SubCommandArgumentValue } from '../../../../core/functions/method';
import { getGuildDataPerSecretCode, securityCodeUpdate } from '../../../../core/functions/restoreCordHelper.js';
import { discordLocales } from '../../../../files/locales.js';
import { format } from '../../../../core/functions/date-and-time.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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

        await securityCodeUpdate({ guildId: interaction.guildId!, apiToken: client.config.api.apiToken, secretCode });

        const members = Data.data.members || [];
        const itemsPerPage = 5;
        let currentCategory = 0;
        let currentPage = 0;

        let footer = await client.method.bot.footerBuilder(interaction);

        const mainEmbed = new EmbedBuilder()
            .setColor(2829617)
            .setTitle("RestoreCord General Infos")
            .setFields(
                { name: "Server Id", value: Data.id || "", inline: true },
                { name: "Given role after verify", value: interaction.guild.roles.cache.get(Data.data.config.roleId)?.toString() || Data.data.config.roleId, inline: true },
                { name: "Create at", value: `*the date is in MM/DD/YYYY HH:mm format*\n\n${format(new Date(Data.data.config.createDate || 0), "MM/DD/YYYY HH:mm")}`, inline: false },
                { name: "Key Used Count", value: String(Data.data.config.securityCodeUsed || 0), inline: true },
                { name: "Configuration Author", value: (await client.users.fetch(Data.data.config.author.id)).toString() || `Unknown user (${Data.data.config.author.id})`, inline: true }
            )
            .setFooter(footer);

        let htmlContent = readFileSync(
            path.join(process.cwd(), 'src', 'assets', 'restoreCordGetPage.html'),
            'utf-8'
        );

        const now = Date.now();

        const timeLabels = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now - ((29 - i) * 24 * 60 * 60 * 1000));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const registrationData = timeLabels.map(dateLabel => {
            return members.filter(member => {
                if (!member.registerTimestamp) return false;

                const memberDate = new Date(member.registerTimestamp);
                const memberDateString = memberDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });

                return memberDateString === dateLabel;
            }).length;
        });

        const localeData = members.reduce((acc: Record<string, number>, member) => {
            acc[member.locale] = (acc[member.locale] || 0) + 1;
            return acc;
        }, {});

        const recentVerifications = members
            .sort((a, b) => b.registerTimestamp - a.registerTimestamp)
            .slice(0, 10)
            .map(member => ({
                username: member.username,
                date: new Date(member.registerTimestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));

        let given_role = interaction.guild.roles.cache.get(Data.data.config.roleId)?.name;

        htmlContent = htmlContent
            .replace('{author_pfp}', interaction.member.user.displayAvatarURL({ size: 512 }))
            .replace('{author_username}', interaction.member.user.globalName || interaction.member.user.displayName)
            .replace('{guild_name}', interaction.guild.name)
            .replace('{config_author}', Data.data.config.author.username)
            .replace('{create_date}', new Date(Data.data.config.createDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }))
            .replace('{role_id}', given_role !== undefined ? "@" + given_role : Data.data.config.roleId)
            .replace('{total_members}', String(members.length))
            .replace('{total_verifications}', String(members.length))
            .replace('{key_used_count}', String(Data.data.config.securityCodeUsed))
            .replace('{registrationData}', JSON.stringify(registrationData))
            .replace('{timeLabels}', JSON.stringify(timeLabels))
            .replace('{localeData}', JSON.stringify(localeData))
            .replace('{recentVerifications}', JSON.stringify(recentVerifications));


        const image = await client.method.imageManipulation.html2Png(htmlContent, {
            elementSelector: '.container',
            omitBackground: true,
            selectElement: true,
        });

        const attachment = new AttachmentBuilder(image, { name: 'image.png' });

        const generateImageEmbed = (): EmbedBuilder => {
            const thirdCategoryEmbed = new EmbedBuilder()
                .setImage("attachment://image.png")
                .setColor(2829617)
                .setTimestamp()
                .setFooter(footer);

            return thirdCategoryEmbed;
        }


        const generateEmbed = (page: number): EmbedBuilder => {
            const embed = new EmbedBuilder()
                .setTitle("Stocked user(s)")
                .setDescription(`Page ${page + 1} / ${Math.ceil(members.length / itemsPerPage)}`)
                .setFooter(footer)
                .setTimestamp();

            const startIndex = page * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, members.length);
            embed.setDescription(members.slice(startIndex, endIndex).map((member, i) => {
                const localeEmoji = discordLocales[member.locale] || "🌐";
                return `${i + 1}) <@${member.id}>\n\`Locale\`: ${localeEmoji} (**${member.locale}**)\n\`Username\`: **${member.username}**`;
            }).join("\n"));

            return embed;
        };

        const getEmbedForCategory = () => {
            switch (currentCategory) {
                case 0: return mainEmbed;
                case 1: return generateEmbed(currentPage);
                case 2: return generateImageEmbed();
                default: return mainEmbed;
            }
        };

        const updateComponents = () => [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("<<<")
                        .setCustomId("pprevious")
                        .setDisabled(currentCategory !== 1 || currentPage === 0),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(client.iHorizon_Emojis.icon.iHorizon_Pages)
                        .setCustomId("pdeco")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel(">>>")
                        .setCustomId("pnext")
                        .setDisabled(currentCategory !== 1 || currentPage >= Math.ceil(members.length / itemsPerPage) - 1)
                ),
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(client.iHorizon_Emojis.icon.iHorizon_Minus)
                        .setCustomId("previous")
                        .setDisabled(currentCategory === 0),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(client.iHorizon_Emojis.icon.iHorizon_Folder)
                        .setCustomId("deco")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(client.iHorizon_Emojis.icon.iHorizon_Plus)
                        .setCustomId("next")
                        .setDisabled(currentCategory >= 2)
                )
        ];

        const message = await interaction.reply({
            embeds: [currentCategory === 0 ? mainEmbed : generateEmbed(currentPage)],
            components: updateComponents(),
            files: [await client.method.bot.footerAttachmentBuilder(interaction)],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) return;

            if (i.customId === "next") {
                currentCategory = Math.min(currentCategory + 1, 2);
                currentPage = 0;
            } else if (i.customId === "previous") {
                currentCategory = Math.max(currentCategory - 1, 0);
                currentPage = 0;
            } else if (i.customId === "pnext" && currentCategory === 1) {
                currentPage++;
            } else if (i.customId === "pprevious" && currentCategory === 1) {
                currentPage--;
            }

            let files = [];

            if (currentCategory === 2) files.push(attachment);

            await i.update({
                embeds: [getEmbedForCategory()],
                components: updateComponents(),
                files
            });
        });


        collector.on('end', async () => {
            await message.edit({ components: [] });
        });
    }
};