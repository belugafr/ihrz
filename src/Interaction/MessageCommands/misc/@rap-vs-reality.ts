import {
    ApplicationCommandOptionType,
    Message,
    Client,
} from 'discord.js';

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs, { writeFileSync } from 'fs';
import { Readable } from 'stream';

import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option.js';
import { axios } from '../../../core/functions/axios.js';
import os from 'os';
import { writeFile } from 'fs/promises';

export const command: Command = {
    name: 'rap-vs-reality',
    aliases: ['meme1'],
    description: 'rap vs reality meme generator',
    description_localizations: {
        "fr": "rap vs reality meme generator",
    },
    options: [
        {
            name: "image1",
            description: "the before sucks",
            description_localizations: {
                "fr": "le screen avant qu'il ce fasse défon",
            },
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "image2",
            description: "the after sucks",
            description_localizations: {
                "fr": "le screen après qu'il ce soit défoncé",
            },
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    thinking: false,
    category: 'misc',
    type: "PREFIX_IHORIZON_COMMAND",
    run: async (
        client: Client,
        interaction: Message<true>,
        lang: LanguageData,
        command: Command | Option | undefined,
        neededPerm,
        options?: string[],
    ) => {
        console.log('Rap vs Reality command called');
        console.log('Options:', options);

        const beforeSucksUrl = client.method.string(options!, 0);
        const bigSucksUrl = client.method.string(options!, 1);

        console.log('Before URL:', beforeSucksUrl);
        console.log('After URL:', bigSucksUrl);

        if (!beforeSucksUrl || !bigSucksUrl) {
            console.error('Missing image URLs');
            return interaction.reply('Please provide two valid image URLs.');
        }

        try {
            console.log('Downloading images...');
            const beforeSucksResponse = await axios.get(beforeSucksUrl, { responseType: 'arraybuffer' });
            const bigSucksResponse = await axios.get(bigSucksUrl, { responseType: 'arraybuffer' });

            const tempDir = path.join(os.tmpdir(), 'rap-vs-reality');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            writeFileSync(tempDir + `/beforeSucks-${interaction.id}.png`, Buffer.from(beforeSucksResponse.data));
            writeFileSync(tempDir + `/bigSucks-${interaction.id}.png`, Buffer.from(bigSucksResponse.data));

            console.log('Images downloaded:',
                beforeSucksResponse.data.byteLength,
                bigSucksResponse.data.byteLength
            );

            const rapRealityPath = path.join(process.cwd(), 'src', 'assets', 'rap-vs-reality');
            console.log('Rap Reality Path:', rapRealityPath);

            console.log(tempDir + `/beforeSucks-${interaction.id}.png`)

            return new Promise((resolve, reject) => {
                const outputPath = path.join(os.tmpdir(), `merged_video_${Date.now()}.mp4`);

                ffmpeg()
                    .input(path.join(rapRealityPath, 'part1.mp4'))
                    .input(path.join(rapRealityPath, 'part2.mp4'))
                    .input(path.join(rapRealityPath, 'part3.mp4'))
                    .input(path.join(rapRealityPath, 'part4.mp4'))
                    .input(tempDir + `/beforeSucks-${interaction.id}.png`)
                    .input(tempDir + `/bigSucks-${interaction.id}.png`)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .outputOptions([
                        '-filter_complex', '[0:v][1:v][2:v][3:v]concat=n=4:v=1[outv];[0:a][1:a][2:a][3:a]concat=n=4:v=0:a=1[outa]',
                        '-map', '[outv]',
                        '-map', '[outa]'
                    ])

                    .output(outputPath)
                    .on('end', async () => {
                        try {
                            console.log('Vidéo fusionnée avec succès');

                            await interaction.reply({
                                files: [{
                                    attachment: outputPath,
                                    name: 'merged_video.mp4'
                                }]
                            });

                            // Nettoyer le fichier temporaire
                            fs.unlinkSync(outputPath);
                            resolve(null);
                        } catch (sendError) {
                            console.error('Erreur lors de l\'envoi de la vidéo:', sendError);
                            reject(sendError);
                        }
                    })
                    .on('error', (err) => {
                        console.error('Erreur FFmpeg:', err);
                        interaction.reply(`Erreur FFmpeg : ${err.message}`);
                        reject(err);
                    })
                    .run();


            });
        } catch (error) {
            console.error('COMPREHENSIVE ERROR:', error);
            interaction.reply(`An error occurred: ${(error as any).message}`);
        }
    }
}