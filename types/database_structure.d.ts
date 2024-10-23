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

import { EmbedBuilder } from "@discordjs/builders";
import { CaseList } from "../src/core/modules/ticketsManager.js";
import { AntiSpam } from "./antispam.js";
import { Platform } from "../src/core/StreamNotifier.js";

export namespace DatabaseStructure {

    export interface DbTableJson {
        BACKUPS?: DbBackupsObject;
        EMBED?: DbEmbedObject;
        [key: string]: DbInId | DbBackupsObject | DbEmbedObject | undefined;
    }

    export interface DbEmbedObject {
        [code: string]: {
            embedOwner: string;
            embedSource: EmbedBuilder;
        };
    }

    export interface DbBackupsObject {
        [userId: string]: DbBackupsUserObject;
    }

    export interface DbBackupsUserObject {
        [backupId: string]: {
            guildName: string;
            categoryCount: number;
            channelCount: number;
        };
    }

    export interface TicketData {
        [userId: string]: TicketUserData;
    }

    export interface TicketUserData {
        [channelId: string]: {
            channel: string;
            author: string;
            alive: boolean;
        };
    }
    export interface ProtectionData {
        [rule: string]: {
            mode: string;
        } | string | undefined;
        SANCTION?: string;
    }

    export interface RoleSaverData {
        [userId: string]: string[];
    }

    export interface RoleSaverSchema {
        enable?: boolean;
        timeout?: string;
        admin?: string;
    }

    export interface AllowListData {
        enable?: boolean;
        list?: {
            [x: string]: {
                allowed: boolean;
            };
        };
    }

    export interface SuggestSchema {
        channel: string;
        disable?: boolean;
    }

    export interface SuggestionData {
        [suggestCode: string]: {
            author: string;
            msgId: string;
            replied?: boolean;
        };
    }

    export interface VoiceData {
        staff_role?: string;
        interface?: {
            channelId?: string;
            messageId?: string;
        };
        voice_channel?: string | undefined;
    };

    export interface GhostPingData {
        channels?: string[];
        active?: boolean;
    }

    export interface PunishPubSchema {
        amountMax?: number;
        punishementType?: string | null;
        state?: string;
    }

    export interface EconomyUserSchema {
        money?: number;
        bank?: number;
        daily?: number;
        monthly?: number;
        weekly?: number;
        work?: number;
    }

    export interface InvitesUserData {
        BY?: {
            inviter: string;
            invite: string;
        };
        regular?: number;
        invites?: number;
        bonus?: number;
        leaves?: number;
    }

    export interface XpLevelingUserSchema {
        xp?: number;
        xptotal?: number;
        level?: number;
    }

    export interface ReactionRolesData {
        [messageId: string]: {
            [reaction: string]: {
                rolesID: string;
                reactionNAME: string;
                enable: boolean;
            };
        };
    }

    export interface SnipeData {
        [channelId: string]: {
            snipe: string;
            snipeUserInfoTag: string;
            snipeUserInfoPp: string;
            snipeTimestamp: number;
        };
    }

    export interface SecuritySchema {
        channel?: string;
        disable?: boolean;
        role?: string;
    }

    export interface ConfessionSchema {
        panel?: {
            channelId: string;
            messageId: string;
        }
        disable?: boolean;
        ALL_CONFESSIONS?: {
            [confessionId: string]: {
                userId?: string;
                timestamp?: number;
                private?: boolean;
            }
        }
        cooldown?: number
    }

    export interface MemberCountSchema {
        member?: {
            name?: string;
            enable?: boolean;
            event?: string;
            channel?: string;
        };
        roles?: {
            name?: string;
            enable?: boolean;
            event?: 'roles';
            channel?: string;
        };
        bot?: {
            name?: string;
            enable?: boolean;
            event?: string;
            channel?: string;
        };
        boost?: {
            name?: string;
            enable?: boolean;
            event?: string;
            channel?: string;
        };
        channel?: {
            name?: string;
            enable?: boolean;
            event?: string;
            channel?: string;
        };
    }

    export interface StatsMessage {
        sentTimestamp: number;
        contentLength: number;
        channelId: string
    }

    export interface StatsVoice {
        startTimestamp: number;
        endTimestamp: number;
        channelId: string
    }

    export interface UserStats {
        messages?: StatsMessage[]
        voices?: StatsVoice[];
    }
    export interface GuildStats {
        USER?: {
            [userId: string]: UserStats
        }
    }

    export interface NotifierUserSchema {
        id_or_username: string;
        platform: Platform;
    }

    export interface NotifierLastNotifiedMedias {
        userId: string;
        mediaId: string;
    }

    export interface NotifierSchema {
        message?: string;
        users?: NotifierUserSchema[];
        lastMediaNotified?: NotifierLastNotifiedMedias[];
        channelId: string;
    }

    export interface WarnSchema {
        archivingTimeout?: number;
        warnThreshold?: number;
        sanction?: "mute" | "kick" | "ban";
        punishment_time?: number;
    }

    export interface DbInId {
        USER?: DbGuildUserObject;
        GUILD?: DbGuildObject;
        TICKET_ALL?: TicketData;
        PROTECTION?: ProtectionData;
        ROLE_SAVER?: RoleSaverData;
        ALLOWLIST?: AllowListData;
        NOTIFIER?: NotifierSchema
        SUGGEST?: SuggestSchema;
        SUGGESTION?: SuggestionData;
        ECONOMY?: {
            disabled: boolean;
        };
        WARN?: WarnSchema;
        SECURITY?: SecuritySchema;
        CONFESSION?: ConfessionSchema;
        VOICE_INTERFACE?: VoiceData;
        UTILS?: UtilsData;
        STATS?: GuildStats;
    }

    export interface UtilsRoleData {
        1?: string;
        2?: string;
        3?: string;
        4?: string;
        5?: string;
        6?: string;
        7?: string;
        8?: string;
    }

    export interface UtilsData {
        PERMS?: UtilsPermsData;
        USER_PERMS?: UtilsPermsUserData;
        unban_members?: string[];
        roles?: UtilsRoleData;
        wlRoles?: string[];
    }

    export interface UtilsPermsData {
        [key: string]: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    }

    export interface UtilsPermsUserData {
        [key: string]: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    }

    export interface DbGuildUserObject {
        [userId: string]: {
            INVITES?: InvitesUserData;
            ECONOMY?: EconomyUserSchema;
            REPORT?: {
                cooldown: number;
            };
            XP_LEVELING?: XpLevelingUserSchema;
            WARNS?: WarnsData[];
        };
    }

    export type WarnsData = { timestamp: number; reason: string; authorID: string; id: string; };

    export interface JoinBannerOptions {
        backgroundURL: string;
        profilePictureRound: "hexProfileColor" | "status";
        message: string;
        textColour: string;
        textSize: string;
        avatarSize: string;
    }

    export interface GuildConfigSchema {
        joinmessage?: string;
        joinbanner?: JoinBannerOptions;
        joinbannerStates?: string;
        join?: string;
        leave?: string;
        joindm?: string;
        joinroles?: string | string[];
        leavemessage?: string;
        mass_mention?: string;
        antipub?: string;
        spam?: string;
        hey_reaction?: boolean;
        rolesaver?: RoleSaverSchema;
        GHOST_PING: GhostPingData;
    }

    export interface BlockNewAccountSchema {
        state: boolean;
        req: number;
    }

    export interface DbGuildBotObject {
        prefix?: string;
        botName?: string;
        botPFP?: string;
    }

    export interface DbGuildXpLeveling {
        message: string;
        disable?: 'disable' | boolean;
        xpchannels?: string;
        bypassChannels?: string[]
    }

    export interface DbGuildObject {
        BOT?: DbGuildBotObject;
        LANG?: {
            lang: string;
        };
        TICKET?: {
            [key: string]: DbTicketConfigurationObject | string | boolean | undefined;
            logs?: string;
            disable?: boolean;
            category?: string;
        };
        GUILD_CONFIG?: GuildConfigSchema
        BLOCK_BOT?: boolean;
        MCOUNT?: MemberCountSchema;
        PUNISH?: {
            PUNISH_PUB?: PunishPubSchema
        };
        SERVER_LOGS?: {
            roles?: string;
            moderation?: string;
            voice?: string;
            message?: string;
            boosts?: string;
            user?: string;
            antispam?: string;
            channel?: string;
            roles?: string;
        };
        SUPPORT?: {
            input?: string | null;
            rolesId?: string;
            state?: string;
        };
        PFPS?: {
            channel?: string;
            disable?: boolean;
        };
        XP_LEVELING?: DbGuildXpLeveling
        REACTION_ROLES?: ReactionRolesData;
        RANK_ROLES?: {
            roles: string;
            nicknames: string;
        };
        SNIPE?: SnipeData;
        REACT_MSG?: {
            [message: string]: string;
        };
        BLOCK_NEW_ACCOUNT?: BlockNewAccountSchema;
        ANTISPAM?: AntiSpam.AntiSpamOptions;
    }

    export interface DbTicketConfigurationObject {
        author: string;
        used: boolean;
        selection?: CaseList[];
        panelName: string;
        channel: string;
        messageID: string;
    }
}