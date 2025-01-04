/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2025 iHorizon
*/
import { EmbedBuilder, } from 'discord.js';
import logger from '../../../core/logger.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel)
            return;
        if (!interaction.member.voice.channel) {
            await client.method.interactionSend(interaction, {
                content: lang.skip_not_in_voice_channel.replace("${client.iHorizon_Emojis.icon.Warning_Icon}", client.iHorizon_Emojis.icon.Warning_Icon)
            });
            return;
        }
        ;
        try {
            let voiceChannel = interaction.member.voice.channel;
            let player = client.player.getPlayer(interaction.guildId);
            let oldName = player?.queue.current?.info.title;
            let channel = interaction.guild.channels.cache.get(player?.textChannelId);
            if (!player || !player.playing || !voiceChannel) {
                await client.method.interactionSend(interaction, { content: lang.skip_nothing_playing });
                return;
            }
            ;
            if (player.queue.tracks.length >= 1) {
                player.skip();
            }
            else {
                player.stopPlaying();
            }
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(2829617)
                        .setDescription(lang.event_mp_playerSkip
                        .replace("${client.iHorizon_Emojis.icon.Music_Icon}", client.iHorizon_Emojis.icon.Music_Icon)
                        .replace("${track.title}", oldName))
                ]
            });
            await client.method.interactionSend(interaction, {
                content: lang.skip_command_work
                    .replace("{queue}", player.queue.current?.info.title),
            });
            return;
        }
        catch (error) {
            logger.err(error);
        }
        ;
    },
};
