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
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let user = interaction.options.getUser("user") || interaction.user;
        let baseData = await db.DataBaseModel({ id: db.Get, key: `${interaction.guild.id}.USER.${user.id}.XP_LEVELING` })
        var level = baseData?.level || 0;
        var currentxp = baseData?.xp || 0;

        var xpNeeded = level * 500 + 500;
        var expNeededForLevelUp = xpNeeded - currentxp;

        let nivEmbed = new EmbedBuilder()
            .setTitle(data.level_embed_title
                .replace('${user.username}', user.globalName)
            )
            .setColor('#0014a8')
            .addFields({
                name: data.level_embed_fields1_name, value: data.level_embed_fields1_value
                    .replace('${currentxp}', currentxp)
                    .replace('${xpNeeded}', xpNeeded), inline: true
            },
                {
                    name: data.level_embed_fields2_name, value: data.level_embed_fields2_value
                        .replace('${level}', level), inline: true
                })
            .setDescription(data.level_embed_description
                .replace('${expNeededForLevelUp}', expNeededForLevelUp)
            )
            .setTimestamp()
            .setThumbnail("https://cdn.discordapp.com/attachments/847484098070970388/850684283655946240/discord-icon-new-2021-logo-09772BF096-seeklogo.com.png")
            .setFooter({ text: 'iHorizon', iconURL: client.user?.displayAvatarURL() });

        await interaction.editReply({ embeds: [nivEmbed] });
        return;
    },
};