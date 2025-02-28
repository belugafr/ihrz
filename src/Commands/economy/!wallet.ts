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
} from 'discord.js';

import * as db from '../../core/functions/DatabaseModel';

export = {
    run: async (client: Client, interaction: any, data: any) => {

        let member = interaction.options.getUser('user') || interaction.user;
        var bal = await db.DataBaseModel({ id: db.Get, key: `${interaction.guild.id}.USER.${member.id}.ECONOMY.money` });

        if (!bal) {
            await db.DataBaseModel({ id: db.Set, key: `${interaction.guild.id}.USER.${member.value}.ECONOMY.money`, value: 1 });
            await interaction.editReply({ content: data.balance_he_dont_have_wallet });
            return;
        };

        await interaction.editReply({
            content: data.balance_he_have_wallet.replace(/\${bal}/g, bal)
        });
        return;
    },
};