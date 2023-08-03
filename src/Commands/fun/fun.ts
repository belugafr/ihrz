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
    AttachmentBuilder,
} from 'discord.js';

import {Command} from '../../../types/command';
import * as db from '../../core/functions/DatabaseModel';
import logger from '../../core/logger';
import config from '../../files/config';
import {createCanvas, loadImage} from 'canvas';

import axios from 'axios';
import ms from 'ms';
import fs from 'fs';

export const command: Command = {
    name: "fun",
    description: "Subcommand for fun category!",
    options: [
        {
            name: 'caracteres',
            description: 'Transform a string into a DarkSasuke!',
            type: 1,
            options: [
                {
                    name: 'nickname',
                    type: ApplicationCommandOptionType.String,
                    description: 'your cool nickname to transform !',
                    required: true
                }
            ],
        },
        {
            name: 'cats',
            description: 'Get a picture of cat!',
            type: 1,
        },
        {
            name: 'dogs',
            description: 'Get a picture of dog!',
            type: 1,
        },
        {
            name: 'hack',
            description: 'Hack a user!',
            type: 1,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user you want to hack",
                    required: true
                }
            ],
        },
        {
            name: 'hug',
            description: 'Hug a user!',
            type: 1,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user you want to hug",
                    required: true
                }
            ],
        },
        {
            name: 'kiss',
            description: 'Kiss a user!',
            type: 1,
            options: [
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.User,
                    description: 'The user you want to kiss',
                    required: true
                }
            ],
        },
        {
            name: 'love',
            description: 'Show your love compatibilty with the user!',
            type: 1,
            options: [
                {
                    name: "user1",
                    type: ApplicationCommandOptionType.User,
                    description: "The user you want to know you love's compatibilty",
                    required: false
                },
                {
                    name: "user2",
                    type: ApplicationCommandOptionType.User,
                    description: "The user you want to know you love's compatibilty",
                    required: false
                }
            ],
        },
        {
            name: 'morse',
            description: 'Transform a string into a Morse!',
            type: 1,
            options: [
                {
                    name: 'input',
                    type: ApplicationCommandOptionType.String,
                    description: 'Enter your input to encrypt/decrypt in morse',
                    required: true
                }
            ],
        },
        {
            name: 'poll',
            description: 'Create a poll!',
            type: 1,
            options: [
                {
                    name: 'message',
                    type: ApplicationCommandOptionType.String,
                    description: 'The message showed on the poll',
                    required: true
                }
            ],
        },
        {
            name: 'question',
            description: 'Ask a question to the bot !',
            type: 1,
            options: [
                {
                    name: 'question',
                    type: ApplicationCommandOptionType.String,
                    description: 'The question you want to give for the bot',
                    required: true
                }
            ],
        },
        {
            name: 'slap',
            description: 'Slap a user!',
            type: 1,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user you want to slap",
                    required: true
                }
            ],
        }
    ],
    category: 'fun',
    run: async (client: Client, interaction: any) => {
        let data = await client.functions.getLanguageData(interaction.guild.id);
        let command: any = interaction.options.getSubcommand();

        if (command === 'caracteres') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'cats') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'dogs') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'hack') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'hug') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'kiss') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'love') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'morse') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'poll') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'question') {
            await require('./!' + command).run(client, interaction, data);
        } else if (command === 'slap') {
            await require('./!' + command).run(client, interaction, data);
        }
        ;
    },
}