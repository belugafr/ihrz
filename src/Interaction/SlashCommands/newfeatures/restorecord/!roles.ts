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
import { changeRoleRestoreCord, getGuildDataPerSecretCode } from '../../../../core/functions/restoreCordHelper.js';
import { SubCommandArgumentValue } from '../../../../core/functions/method';
import { LanguageData } from '../../../../../types/languageData';

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
        const role = interaction.options.getRole("roles")!;

        const table = client.db.table("RESTORECORD");
        const Data = getGuildDataPerSecretCode(await table.all(), secretCode);

        if (!Data) return client.method.interactionSend(interaction, {
            content: `${client.iHorizon_Emojis.icon.No_Logo} The RestoreCord module with key: **${secretCode}** doesn't exist!`,
            ephemeral: true
        });

        await changeRoleRestoreCord({ guildId: interaction.guildId!, apiToken: client.config.api.apiToken, roleId: role.id });

        let footer = await client.method.bot.footerBuilder(interaction);

        const mainEmbed = new EmbedBuilder()
            .setColor(2829617)
            .setTitle("RestoreCord New Modifiication")
            .setFields(
                { name: "New Given role after verify", value: role.toString(), inline: true },
            )
            .setFooter(footer);

        await client.method.interactionSend(interaction, {
            embeds: [mainEmbed],
            files: [await client.method.bot.footerAttachmentBuilder(interaction)]
        });
        return;
    }
};