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
import config from "../../files/config.js";
export var ClusterMethod;
(function (ClusterMethod) {
    ClusterMethod[ClusterMethod["CreateContainer"] = 0] = "CreateContainer";
    ClusterMethod[ClusterMethod["DeleteContainer"] = 1] = "DeleteContainer";
    ClusterMethod[ClusterMethod["StartupContainer"] = 2] = "StartupContainer";
    ClusterMethod[ClusterMethod["ShutdownContainer"] = 3] = "ShutdownContainer";
    ClusterMethod[ClusterMethod["PowerOnContainer"] = 4] = "PowerOnContainer";
    ClusterMethod[ClusterMethod["ChangeTokenContainer"] = 5] = "ChangeTokenContainer";
    ClusterMethod[ClusterMethod["ChangeOwnerContainer"] = 6] = "ChangeOwnerContainer";
    ClusterMethod[ClusterMethod["ChangeExpireTime"] = 7] = "ChangeExpireTime";
    ClusterMethod[ClusterMethod["StartupCluster"] = 8] = "StartupCluster";
    ClusterMethod[ClusterMethod["ShutDownCluster"] = 9] = "ShutDownCluster";
})(ClusterMethod || (ClusterMethod = {}));
;
export var GatewayMethod;
(function (GatewayMethod) {
    GatewayMethod[GatewayMethod["GenerateOauthLink"] = 0] = "GenerateOauthLink";
    GatewayMethod[GatewayMethod["CreateRestoreCordGuild"] = 1] = "CreateRestoreCordGuild";
    GatewayMethod[GatewayMethod["ForceJoinRestoreCord"] = 2] = "ForceJoinRestoreCord";
    GatewayMethod[GatewayMethod["AddSecurityCodeAmount"] = 3] = "AddSecurityCodeAmount";
    GatewayMethod[GatewayMethod["ChangeRole"] = 4] = "ChangeRole";
    GatewayMethod[GatewayMethod["UserInfo"] = 5] = "UserInfo";
})(GatewayMethod || (GatewayMethod = {}));
;
export function assetsFinder(body, type) {
    return `https://raw.githubusercontent.com/ihrz/assets/main/${type}/${Math.floor(Math.random() * body[type])}.gif`;
}
;
export function OwnIhrzCluster(options) {
    var data = config.core.cluster[options.cluster_number];
    var admin_key = config.api.apiToken;
    data += "/api/v1/instance/";
    switch (options.cluster_method) {
        case 0:
            data += "create";
            break;
        case 1:
            data += `delete`;
            if (!options.bot_id)
                throw "Error: bot_id doesn't found!";
            if (options.bot_id)
                data += `/${options.bot_id}`;
            if (admin_key)
                data += `/${admin_key}`;
            break;
        case 2:
            data += `startup`;
            if (!options.bot_id)
                throw "Error: bot_id doesn't found!";
            if (options.bot_id)
                data += `/${options.bot_id}`;
            if (admin_key)
                data += `/${admin_key}`;
            break;
        case 3:
            data += `shutdown`;
            if (!options.bot_id)
                throw "Error: bot_id doesn't found!";
            if (options.bot_id)
                data += `/${options.bot_id}`;
            if (options.forceDatabaseSet)
                data += `/${options.forceDatabaseSet}`;
            if (admin_key)
                data += `/${admin_key}`;
            break;
        case 4:
            data += `poweron`;
            if (!options.bot_id)
                throw "Error: bot_id doesn't found!";
            if (options.bot_id)
                data += `/${options.bot_id}`;
            if (admin_key)
                data += `/${admin_key}`;
            break;
        case 5:
            data += `change_token`;
            if (!options.bot_id)
                throw "Error: bot_id doesn't found!";
            if (!options.discord_bot_token)
                throw "Error: discord_bot_token doesn't found!";
            if (options.bot_id)
                data += `/${options.bot_id}`;
            if (options.discord_bot_token)
                data += `/${options.discord_bot_token}`;
            if (admin_key)
                data += `/${admin_key}`;
            break;
        case 6:
            data += `change_owner`;
            break;
        case 7:
            data += `change_time`;
            break;
        case 8:
            data += `startup_cluster`;
            break;
        case 9:
            data += `shutdown_cluster`;
            break;
    }
    return data;
}
;
export function HorizonGateway(gateway_method) {
    var data = config.api.HorizonGateway;
    if (!data)
        throw "Error: HorizonGateway empty in the configurations files";
    switch (gateway_method) {
        case 0:
            data += "/api/ihorizon/v1/oauth2";
            break;
        case 1:
            data += "/api/ihorizon/v1/create-oauth2";
            break;
        case 2:
            data += "/api/ihorizon/v1/forcejoin";
            break;
        case 3:
            data += "/api/ihorizon/v1/securityCodeUpdate";
            break;
        case 4:
            data += "/api/ihorizon/v1/role";
            break;
        case 5:
            data += "/api/ihorizon/v1/userinfo";
            break;
    }
    return data;
}
