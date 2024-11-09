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

                        // await client.method.iHorizonLogs.send(interaction, {
                        //     title: lang.buttonreaction_logs_embed_title_added,
                        //     description: lang.buttonreaction_logs_embed_description_added
                        //         .replace("${interaction.user.id}", interaction.member?.user.id!)
                        //         .replace("${messagei}", messagei!)
                        //         .replace("${reaction}", reaction)
                        //         .replace("${role}", role?.toString()!)
                        // });

                        let msgLink = `https://discord.com/channels/${interaction.guildId}/${channel?.id}/${messagei}`;

                        await client.method.interactionSend(interaction, {
                            content: `${interaction.user.toString()}, vous venez de configurer le module "RestoreCord". Maintenant, quand un membre du serveur discord clique sur le bouton et qu'il se connecteras en Oauth2, il seras dans la base de données.
Il pourras tôt ou tard, rejoindre le serveur automatiquement avec l'oAuth2.\n# LISEZ AVEC ATTENTION\nLe message ${msgLink} possède maintenant un bouton qui feras office de vérification.
VOICI LE CODE PRIVÉE QUI NE DOIS ÊTRE DILVUGUÉ À PERSONNES. UNE PERSONNES POSSÈDANT CE CODE POURRAIT, LE SUPPRIMER, AJOUTER DES MEMBRES SUR SONT SERVEUR... GARDER-LE QUEL'QUES PART. iHorizon NE VOUS LE DONNERAS PLUS JAMAIS:
\`\`\`${res.secretCode}\`\`\``, ephemeral: true
                        });

                        await interaction.user.send(`# Le code de RestoreCord de ${interaction.guild.name}\n\`\`\`${res.secretCode}\`\`\``)
                            .catch(() => interaction.followUp({ content: "J'ai voulu vous envoyer le code en message privée mais vous avez bloquer vos MP :/", ephemeral: true }))
                            .then(() => interaction.followUp({ content: "Au cas où, je vous ai envoyer le code en message privée !", ephemeral: true }))
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