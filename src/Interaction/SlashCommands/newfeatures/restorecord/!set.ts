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

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Channel,
    ChatInputCommandInteraction,
    Client,
    GuildTextBasedChannel,
    PermissionsBitField
} from 'discord.js';
import { LanguageData } from '../../../../../types/languageData';
import { SubCommandArgumentValue } from '../../../../core/functions/method';
import { createRestoreCord, createRestoreCordLink } from '../../../../core/functions/restoreCordHelper.js';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, command: SubCommandArgumentValue) => {
        let permCheck = await client.method.permission.checkCommandPermission(interaction, command.command!);
        if (!permCheck.allowed) return client.method.permission.sendErrorMessage(interaction, lang, permCheck.neededPerm || 0);

        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        if ((!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) && permCheck.neededPerm === 0)) {
            await interaction.reply({ content: lang.security_disable_not_admin });
            return;
        };

        var channel = interaction.options.getChannel("channel") as Channel | null;
        var messagei = interaction.options.getString("messageid");
        var role = interaction.options.getRole("role");

        if (!role) { return await client.method.interactionSend(interaction, { content: lang.buttonreaction_roles_not_found }); };

        await (channel as GuildTextBasedChannel | null)?.messages.fetch(messagei!)
            .then(async msg => {
                if (msg?.author.id !== client.user?.id) {
                    return await client.method.interactionSend(interaction, { content: lang.buttonreaction_message_other_user_error });
                }

                let buttonLink = createRestoreCordLink({ guildId: interaction.guildId, clientId: client.user.id });

                createRestoreCord({
                    guildId: interaction.guildId,
                    apiToken: client.config.api.apiToken,
                    roleId: role?.id,
                    author: interaction.user
                })
                    .then(async (res) => {

                        msg.edit({
                            components: [
                                new ActionRowBuilder<ButtonBuilder>().addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Link)
                                        .setLabel("Verify")
                                        .setURL(buttonLink)
                                )
                            ]
                        })

                        let msgLink = `https://discord.com/channels/${interaction.guildId}/${channel?.id}/${messagei}`;

                        await client.method.interactionSend(interaction, {
                            content: `${interaction.user.toString()}, you have just set up the "RestoreCord" module. Now, when a member of the Discord server clicks on the button and logs in via OAuth2, they will be added to the database. They will eventually be able to automatically join the server with OAuth2.\n# READ CAREFULLY\nThe message ${msgLink} now has a button that will serve as a verification.\nHERE IS THE PRIVATE CODE THAT MUST NOT BE DISCLOSED TO ANYONE. A PERSON WITH THIS CODE COULD DELETE IT, ADD MEMBERS TO THEIR SERVER... KEEP IT SOMEWHERE SAFE. iHorizon WILL NEVER GIVE IT TO YOU AGAIN:\n\`\`\`${res.secretCode}\`\`\``,
                            ephemeral: true
                        });

                        await interaction.user.send(`# The RestoreCord code for ${interaction.guild.name}\n\`\`\`${res.secretCode}\`\`\``)
                            .catch(() => interaction.followUp({ content: "I tried to send you the code in a private message, but you have blocked your DMs :/", ephemeral: true }))
                            .then(() => interaction.followUp({ content: "In case you missed it, I sent you the code in a private message!", ephemeral: true }))
                            ;

                        await client.db.set(`${interaction.guildId}.GUILD.RESTORECORD`, {
                            channelId: channel?.id,
                            messageId: messagei,
                        });

                    })
                    .catch(async () => {
                        await client.method.interactionSend(interaction, { content: "Error: HorizonGateway maybe down" });
                        return;
                    })

            })
            .catch(async (err) => {
                console.error(err)
                await client.method.interactionSend(interaction, { content: lang.reactionroles_cant_fetched_reaction_remove })
                return;
            });
        return;

    },
};