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
    Collection,
    EmbedBuilder,
    Permissions,
    ApplicationCommandType,
    PermissionsBitField,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    SelectMenuBuilder,
    ComponentType,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuOptionBuilder,
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let blockQ = await db.DataBaseModel({id: db.Get, key: `${interaction.guild.id}.GUILD.TICKET.disable`});

        if (blockQ) {
            return interaction.reply({content: data.open_disabled_command});
        }
        ;

        if (interaction.channel.name.includes('ticket-')) {
            const member = interaction.guild.members.cache.get(interaction.channel.name.split('ticket-').join(''));
            try {
                interaction.channel.permissionOverwrites.edit(member.id, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    ATTACH_FILES: true,
                    READ_MESSAGE_HISTORY: true,
                })
                    .then(() => {
                        return interaction.reply({
                            content: data.open_command_work
                                .replace(/\${interaction\.channel}/g, interaction.channel)
                        });
                    });
            } catch (e: any) {
                return interaction.reply({content: data.open_command_error});
            }
            ;
        } else {
            return await interaction.reply({content: data.open_not_in_ticket});
        }
        ;

    },
}