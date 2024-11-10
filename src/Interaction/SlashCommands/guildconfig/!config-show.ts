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
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { DatabaseStructure } from '../../../../types/database_structure';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, command: Option | Command | undefined, neededPerm: number) => {        


        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        if ((!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && neededPerm === 0)) {
            await interaction.editReply({ content: lang.guildprofil_not_admin });
            return;
        }

        const originalResponse = await interaction.editReply({
            content: client.iHorizon_Emojis.icon.iHorizon_Discord_Loading
        });

        let baselang = await client.db.get(`${interaction.guildId}.GUILD`) as DatabaseStructure.DbInId['GUILD'];
        const pages: EmbedBuilder[] = [];

        const joinDmMessageField = { name: lang.guildprofil_embed_fields_joinDmMessage, value: baselang?.GUILD_CONFIG?.joindm ? '```' + baselang?.GUILD_CONFIG?.joindm.substring(0, 1020) + '```' : lang.guildprofil_not_set_joinDmMessage };
        const joinMessageField = { name: lang.guildprofil_embed_fields_joinmessage, value: baselang?.GUILD_CONFIG?.joinmessage ? '```' + baselang?.GUILD_CONFIG?.joinmessage + '```' : lang.guildprofil_not_set_joinmessage };
        const leaveMessageField = { name: lang.guildprofil_embed_fields_leavemessage, value: baselang?.GUILD_CONFIG?.leavemessage ? '```' + baselang?.GUILD_CONFIG?.leavemessage + '```' : lang.guildprofil_not_set_leavemessage };

        const setChannelsLeaveField = { name: lang.guildprofil_embed_fields_setchannelsleave, value: baselang?.GUILD_CONFIG?.leave ? `<#${baselang?.GUILD_CONFIG?.leave}>` : lang.guildprofil_not_set_setchannelsleave };
        const setChannelsJoinField = { name: lang.guildprofil_embed_fields_setchannelsjoin, value: baselang?.GUILD_CONFIG?.join ? `<#${baselang?.GUILD_CONFIG?.join}>` : lang.guildprofil_not_set_setchannelsjoin };

        const joinRolesField = {
            name: lang.guildprofil_embed_fields_joinroles,
            value: Array.isArray(baselang?.GUILD_CONFIG?.joinroles) && baselang?.GUILD_CONFIG?.joinroles.length > 0
                ? baselang?.GUILD_CONFIG?.joinroles.map(x => `<@&${x}>`).join(', ')
                : lang.guildprofil_not_set_joinroles
        };
        const blockPubField = { name: lang.guildprofil_embed_fields_blockpub, value: (baselang?.GUILD_CONFIG?.antipub === 'on') ? lang.guildprofil_set_blockpub : lang.guildprofil_not_set_blockpub };

        const punishPubField = {
            name: lang.guildprofil_embed_fields_punishPub,
            value: baselang?.PUNISH?.PUNISH_PUB ? lang.guildprofil_set_punishPub
                .replace(/\${punishPub\.punishementType}/g, baselang.PUNISH.PUNISH_PUB.punishementType ?? '')
                .replace(/\${punishPub\.amountMax}/g, String(baselang.PUNISH.PUNISH_PUB.amountMax ?? 0)) : lang.guildprofil_not_set_punishPub
        };
        const supportConfigField = {
            name: lang.guildprofil_embed_fields_supportConfig,
            value: supportConfigToString(baselang?.SUPPORT, lang)
        };
        const ticketFetchedField = {
            name: lang.guildprofil_embed_fields_ticketFetched,
            value: ticketFetchedToString(baselang?.TICKET, lang)
        };
        const reactionRoleField = {
            name: lang.guildprofil_embed_fields_reactionrole,
            value: reactionRolesToString(baselang?.REACTION_ROLES, interaction.guild, lang)
        };
        const xpStatsField = {
            name: lang.guildprofil_embed_fields_ranks,
            value: xpStatsToString(baselang?.XP_LEVELING, lang)
        };
        const logsField = {
            name: lang.guildprofil_embed_fields_logs,
            value: logsToString(baselang?.SERVER_LOGS, lang)
        };
        const blockBotField = {
            name: lang.guildprofil_embed_fields_blockbot,
            value: blockBotToString(baselang?.BLOCK_BOT, lang)
        };

        const generateEmbedForFields = (fields: { name: string, value: string }[]) => {
            const embed = new EmbedBuilder()
                .setColor("#016c9a")
                .setDescription(lang.guildprofil_embed_description.replace(/\${interaction\.guild\.name}/g, interaction.guild?.name as string))
                .addFields(fields)
                .setThumbnail(interaction.guild?.iconURL() as string);
            pages.push(embed);
        };

        generateEmbedForFields([
            joinMessageField,
            leaveMessageField,
            setChannelsJoinField,
            setChannelsLeaveField,
            joinRolesField,
            joinDmMessageField
        ]);

        generateEmbedForFields([
            ticketFetchedField,
            reactionRoleField
        ]);

        generateEmbedForFields([
            blockPubField,
            punishPubField,
            supportConfigField,
        ]);

        generateEmbedForFields([
            xpStatsField,
            logsField,
            blockBotField
        ]);

        let currentPage = 0;

        const editCurrentPage = async () => {
            await interaction.editReply({
                content: null,
                embeds: [
                    pages[currentPage]
                        .setColor("#016c9a")
                        .setFooter({
                            text: lang.prevnames_embed_footer_text
                                .replace('${currentPage + 1}', (currentPage + 1).toString())
                                .replace('${pages.length}', pages.length.toString())
                        })
                ],
                components: [generateActionRow()],
            });
        };

        const generateActionRow = () => {
            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('<<')
                        .setCustomId('guildconf_before')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setLabel('>>')
                        .setCustomId('guildconf_after')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === pages.length - 1)
                );
            return actionRow;
        };

        await editCurrentPage();

        const collector = interaction.channel?.createMessageComponentCollector({
            filter: (i) => originalResponse.id == i.message.id && i.user.id === i.user.id,
            time: 60000
        });

        collector?.on('collect', async interaction => {
            await interaction.deferUpdate();
            if (interaction.customId === 'guildconf_before' && currentPage > 0) {
                currentPage--;
                await editCurrentPage();
            } else if (interaction.customId === 'guildconf_after' && currentPage < pages.length - 1) {
                currentPage++;
                await editCurrentPage();
            }
        });

        collector?.on('end', () => {
            const newComp = generateActionRow();

            newComp.components.forEach(x => {
                x.setDisabled(true);
            });

            interaction.editReply({
                components: [newComp],
            });
        });
    }
};

function supportConfigToString(supportConfig: any, lang: LanguageData): string {
    return supportConfig ? lang.guildprofil_set_supportConfig
        .replace(/\${supportConfig\.input}/g, supportConfig.input ?? '')
        .replace(/\${supportConfig\.rolesId}/g, supportConfig.rolesId ?? '') : lang.guildprofil_not_set_supportConfig;
}

function ticketFetchedToString(charForTicket: any, lang: LanguageData): string {
    let ticketFetched = '';
    for (const i in charForTicket) {
        const ticketConfig = charForTicket[i];
        if (ticketConfig && typeof ticketConfig !== 'string' && typeof ticketConfig !== 'boolean' && ticketConfig.used) {
            ticketFetched += `**${ticketConfig.panelName}**: <#${ticketConfig.channel}>\n`;
        }
    }
    return ticketFetched || lang.guildprofil_not_set_ticketFetched;
}

function reactionRolesToString(charForRr: any, guild: any, lang: LanguageData): string {
    let reactionrole = '';
    for (const i in charForRr) {
        const a = charForRr[i];
        if (a) {
            let stringContent = Object.keys(a).map((key) => {
                const rolesID = a?.[key].rolesID;
                const emoji = guild?.emojis.cache.find((emoji: { id: string; }) => emoji.id === key);

                return lang.guildprofil_set_reactionrole
                    .replace(/\${rolesID}/g, rolesID!)
                    .replace(/\${emoji\s*\|\|\s*key}/g, (emoji || key) as string)
                    .replace(/\${i}/g, i);
            }).join('\n');
            reactionrole = stringContent;
        }
    }
    return reactionrole || lang.guildprofil_not_set_reactionrole;
}

function xpStatsToString(xp: any, lang: LanguageData): string {
    return (xp?.disable === false) ? (xp?.xpchannels ? lang.guildprofil_another_enable_xp.replace('${xp.xpchannels}', xp.xpchannels) : lang.guildprofil_enable_xp) : lang.guildprofil_disable_xp;
}

function logsToString(logs: DatabaseStructure.DbGuildObject['SERVER_LOGS'], lang: LanguageData): string {
    return logs ? [logs.roles, logs.moderation, logs.voice, logs.message, logs.boosts, logs.antispam].filter(Boolean).map(log => `<#${log}>`).join(',') : lang.guildprofil_not_logs_set;
}

function blockBotToString(blockBot: any, lang: LanguageData): string {
    return blockBot ? lang.guildprofil_blockbot_on : lang.guildprofil_blockbot_off;
}