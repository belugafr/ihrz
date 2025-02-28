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
    CategoryChannel,
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let category = interaction.options.getChannel("category-name");

        if (await db.DataBaseModel({ id: db.Get, key: `${interaction.guild.id}.GUILD.TICKET.disable` })) {
            await interaction.editReply({ content: data.setticketcategory_disabled_command });
            return;
        };

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({ content: data.setticketcategory_not_admin });
            return;
        };

        if (!(category instanceof CategoryChannel)) {
            await interaction.editReply({ content: data.setticketcategory_not_a_category });
            return;
        };

        await db.DataBaseModel({
            id: db.Set, key: `${interaction.guild.id}.GUILD.TICKET.category`,
            value: category.id
        });

        let embed = new EmbedBuilder()
            .setFooter({ text: 'iHorizon', iconURL: client.user?.displayAvatarURL() })
            .setColor('#00FFFF')
            .setDescription(data.setticketcategory_command_work
                .replace('${category.name}', category.name)
                .replace('${interaction.user.id}', interaction.user.id)
            );

        await interaction.editReply({ embeds: [embed], ephemeral: false });
        return;
    },
};