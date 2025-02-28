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
    PermissionsBitField,
} from 'discord.js';

export = {
    run: async (client: Client, interaction: any, data: any) => {
        let pollMessage = interaction.options.getString("message");

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.poll_not_admin });
            return;
        };

        let pollEmbed = new EmbedBuilder()
            .setTitle(data.poll_embed_title
                .replace(/\${interaction\.user\.username}/g, interaction.user.globalName)
            )
            .setColor("#ddd98b")
            .setDescription(pollMessage)
            .addFields({ name: data.poll_embed_fields_reaction, value: data.poll_embed_fields_choice })
            .setImage("https://cdn.discordapp.com/attachments/610152915063013376/610947097969164310/loading-animation.gif")
            .setTimestamp()

        let msg = await interaction.editReply({ embeds: [pollEmbed], fetchReply: true });

        await msg.react('✅');
        await msg.react('❌');

        return;
    },
};