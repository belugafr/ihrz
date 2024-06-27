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

/*
・ ElektraBots Discord Bot (https://github.com/belugafr/ElektraBots)

・ Mainly developed by NayaWeb (https://github.com/belugafr)

・ Copyright © 2021-2023 ElektraBots
*/

import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    User,
} from 'pwss'

import { AxiosResponse, axios } from '../../../core/functions/axios.js';
import { LanguageData } from '../../../../types/languageData.js';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction, data: LanguageData) => {
        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        let entry = interaction.options.getString('comment');
        let args: Array<string> = entry!.split(' ');

        let user: User = interaction.options.getUser('user') || interaction.user;

        if (args.length < 1) {
            await interaction.editReply({ content: data.fun_var_good_sentence });
            return;
        };

        let username = user.username;
        let displayname = user.globalName;

        if (username.length > 15) {
            username = username.substring(0, 15);
        };

        if (displayname && displayname.length > 15) {
            displayname = displayname.substring(0, 15);
        };

        if (username.length > 15) {
            username = username.substring(0, 15);
        };

        let link = `https://some-random-api.com/canvas/misc/tweet?avatar=${encodeURIComponent((user.displayAvatarURL({ extension: 'png', size: 1024 })))}&username=${encodeURIComponent((username))}&comment=${encodeURIComponent(args.join(' '))}&displayname=${encodeURIComponent((displayname!))}`;

        let embed = new EmbedBuilder()
            .setColor('#000000')
            .setImage('attachment://tweet-elektra.png')
            .setTimestamp()
            .setFooter({ text: 'iHorizon x ElektraBots', iconURL: "attachment://icon.png" });

        let imgs: AttachmentBuilder;

        await axios.get(link, { responseType: 'arrayBuffer' }).then((response: AxiosResponse) => {
            imgs = new AttachmentBuilder(Buffer.from(response.data, 'base64'), { name: 'tweet-elektra.png' });
            embed.setImage(`attachment://tweet-elektra.png`);
        });

        await interaction.editReply({ embeds: [embed], files: [imgs!, { attachment: await interaction.client.func.image64(interaction.client.user.displayAvatarURL()), name: 'icon.png' }] });
        return;
    },
};