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
  Message,
} from 'pwss';

import Jimp from 'jimp';

import { LanguageData } from '../../../../types/languageData.js';
import { axios } from '../../../core/functions/axios.js';
import { SubCommandArgumentValue } from '../../../core/functions/arg.js';

export default {
  run: async (client: Client, interaction: ChatInputCommandInteraction | Message, lang: LanguageData, command: SubCommandArgumentValue, execTimestamp?: number, args?: string[]) => {
    // Guard's Typing
    if (!interaction.member || !client.user || !interaction.guild || !interaction.channel) return;

    let baseImg = (await axios.get('https://api.thecatapi.com/v1/images/search?mime_types=jpg,png')).data;

    if (interaction instanceof ChatInputCommandInteraction) {
      var text = interaction.options.getString('text')?.slice(0, 30);
    } else {
      var _ = await client.args.checkCommandArgs(interaction, command, args!, lang); if (!_) return;
      var text = client.args.longString(args!, 0) as string | undefined;
    }

    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    const newImg = await Jimp.read(baseImg[0].url);
    const textWidth = Jimp.measureText(font, text);
    const textHeight = Jimp.measureTextHeight(font, text, newImg.bitmap.width);
    const textX = (newImg.bitmap.width - textWidth) / 2;
    const textY = newImg.bitmap.height - textHeight - 10;

    newImg.print(font, textX, textY, text);

    let embed = new EmbedBuilder()
      .setColor('#000000')
      .setImage('attachment://all-human-have-rights-elektra.png')
      .setTimestamp()
      .setFooter(await client.args.bot.footerBuilder(interaction));

    let imgs: AttachmentBuilder | undefined;

    try {
      imgs = new AttachmentBuilder(await newImg.getBufferAsync(Jimp.MIME_GIF), { name: 'all-humans-have-right-elektra.png' });
      embed.setImage(`attachment://all-humans-have-right-elektra.png`);

      if (imgs) {
        await client.args.interactionSend(interaction, {
          embeds: [embed],
          files: [imgs, { attachment: await client.func.image64(client.user.displayAvatarURL()), name: 'footer_icon.png' }]
        });
      };

    } catch {
      await client.args.interactionSend(interaction, { content: lang.fun_var_down_api });
    }

    return;
  },
};
