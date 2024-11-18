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

import { Client, User, VoiceState, time } from 'discord.js';

import { BotEvent } from '../../../types/event';
import { DatabaseStructure } from '../../../types/database_structure';
import { getDomSubVoiceChannel } from '../../core/functions/leashModuleHelper';

export const event: BotEvent = {
    name: "voiceStateUpdate",
    run: async (client: Client, oldState: VoiceState, newState: VoiceState) => {

        let baseData = await client.db.get(`${newState.guild.id}.UTILS.LEASH`) as DatabaseStructure.UtilsData["LEASH"];

        let indexFinded = baseData?.find(x => x.sub === newState.member?.id);

        if (indexFinded) {
            let subMember = newState.member!;
            let domMember = newState.guild.members.cache.get(indexFinded.dom);

            let subChannel = getDomSubVoiceChannel(subMember);
            let domChanel = getDomSubVoiceChannel(domMember!);

            if ((subChannel && domChanel) && (subChannel !== domChanel)) {
                await subMember.voice.setChannel(domChanel);
            }
        }
    },
};