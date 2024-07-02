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
    ChatInputCommandInteraction,
    ApplicationCommandType,
    Message
} from 'pwss'

import { Command } from '../../../../types/command';
import { LanguageData } from '../../../../types/languageData';

export const command: Command = {
    name: 'botinfo',

    description: 'Get information about the bot!',
    description_localizations: {
        "fr": "Obtenir les informations supplémentaire par rapport au bot."
    },

    aliases: ["bi"],

    category: 'bot',
    thinking: false,
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction | Message) => {
        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

        let data = await client.func.getLanguageData(interaction.guildId) as LanguageData;
        let usersize = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

        let clientembed = new EmbedBuilder()
            .setColor("#f0d020")
            .setThumbnail("attachment://footer_icon.png")
            .addFields(
                { name: data.botinfo_embed_fields_myname, value: `\`\`\`${client.user.username}\`\`\``, inline: false },
                { name: data.botinfo_embed_fields_mychannels, value: `\`\`\`py\n${client.channels.cache.size}\`\`\``, inline: false },
                { name: data.botinfo_embed_fields_myservers, value: `\`\`\`py\n${client.guilds.cache.size}\`\`\``, inline: false },
                { name: data.botinfo_embed_fields_members, value: `\`\`\`py\n${usersize}\`\`\``, inline: false },
                { name: data.botinfo_embed_fields_libraires, value: `\`\`\`py\npwss@${client.version.djs}\`\`\``, inline: false },
                { name: data.botinfo_embed_fields_created_at, value: "<t:1600042320:R>", inline: false },
                { name: data.botinfo_embed_fields_created_by, value: "<@171356978310938624>", inline: false },
            )
            .setTimestamp()
            .setFooter(await client.args.bot.footerBuilder(interaction))
            .setTimestamp()

        await client.args.interactionSend(interaction, { embeds: [clientembed], files: [{ attachment: await client.func.image64(client.user.displayAvatarURL()), name: 'footer_icon.png' }] });
        return;
    },
};