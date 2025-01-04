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
import { EmbedBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, } from 'discord.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel)
            return;
        let pause = new ButtonBuilder()
            .setCustomId('pause')
            .setLabel('⏯')
            .setStyle(ButtonStyle.Success);
        let stop = new ButtonBuilder()
            .setCustomId('stop')
            .setLabel('⏹️')
            .setStyle(ButtonStyle.Primary);
        let lyricsButton = new ButtonBuilder()
            .setCustomId('lyrics')
            .setLabel('📝')
            .setStyle(ButtonStyle.Secondary);
        let btn = new ActionRowBuilder()
            .addComponents(stop, pause, lyricsButton);
        let player = client.player.getPlayer(interaction.guildId);
        let voiceChannel = interaction.member.voice.channel;
        if (!player || !player.playing || !voiceChannel) {
            await client.method.interactionSend(interaction, { content: lang.nowplaying_no_queue });
            return;
        }
        ;
        let progress = client.func.generateProgressBar(player.position, player.queue.current?.info.duration);
        let embed = new EmbedBuilder()
            .setTitle(lang.nowplaying_message_embed_title)
            .setDescription(`by: ${(player.queue.current?.requester).toString()}\n**[${player.queue.current?.info.title}](${player.queue.current?.info?.uri})**, ${player.queue.current?.info?.author}`)
            .addFields({ name: '  ', value: progress?.replace(/ 0:00/g, 'LIVE') });
        if (player.queue.current?.info?.artworkUrl)
            embed.setThumbnail(player.queue.current?.info?.artworkUrl);
        let response = await client.method.interactionSend(interaction, {
            embeds: [embed],
            components: [btn],
        });
        var paused = false;
        let collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });
        try {
            collector.on('collect', async (i) => {
                if (player || voiceChannel) {
                    if (!player || !player.playing || !voiceChannel) {
                        await i.reply({ content: lang.nowplaying_no_queue, ephemeral: true });
                        return;
                    }
                    ;
                    let channel = i.guild?.channels.cache.get(player.textChannelId);
                    let requesterId = (player.queue.current?.requester).id;
                    if (i.user.id === requesterId) {
                        switch (i.customId) {
                            case "pause":
                                await i.deferUpdate();
                                if (paused) {
                                    player.resume();
                                    paused = false;
                                    channel?.send({ content: lang.nowplaying_resume_button.replace('${interaction.user}', interaction.member?.user.toString()) });
                                }
                                else {
                                    player.pause();
                                    paused = true;
                                    channel?.send({ content: lang.nowplaying_pause_button.replace('${interaction.user}', interaction.member?.user.toString()) });
                                }
                                break;
                            case "lyrics":
                                await i.deferReply({ ephemeral: true });
                                var lyrics = await client.lyricsSearcher.search(player.queue.current?.info?.title +
                                    player.queue.current?.info?.author).catch(() => {
                                    lyrics = null;
                                });
                                if (!lyrics) {
                                    i.reply({ content: lang.nowplaying_lyrics_button, ephemeral: true });
                                }
                                else {
                                    let trimmedLyrics = lyrics.lyrics.substring(0, 1997);
                                    let embed = new EmbedBuilder()
                                        .setTitle(player.queue.current?.info?.title)
                                        .setURL(player.queue.current?.info?.uri)
                                        .setTimestamp()
                                        .setThumbnail(lyrics.image)
                                        .setAuthor({
                                        name: player.queue.current?.info?.author,
                                    })
                                        .setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics)
                                        .setColor('#cd703a')
                                        .setFooter(await client.method.bot.footerBuilder(interaction));
                                    i.editReply({
                                        embeds: [embed],
                                        files: [await interaction.client.method.bot.footerAttachmentBuilder(interaction)]
                                    });
                                }
                                ;
                                break;
                            case "stop":
                                await i.deferUpdate();
                                player.destroy();
                                channel.send({ content: lang.nowplaying_stop_buttom.replace('${interaction.user}', interaction.member?.user.toString()) });
                                break;
                        }
                    }
                    else {
                        await i.reply({ content: client.iHorizon_Emojis.icon.No_Logo, ephemeral: true });
                    }
                }
            });
            collector.on('end', async (i) => {
                btn.components.forEach(x => {
                    x.setDisabled(true);
                });
                await response.edit({ components: [] });
            });
        }
        catch {
            await client.method.channelSend(interaction, client.iHorizon_Emojis.icon.Timer);
            return;
        }
        ;
    }
};
