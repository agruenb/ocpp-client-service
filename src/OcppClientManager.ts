import Logger from "./logs/Logger";
import { StatusNotification } from "./messageHandlersOcpp16/StatusNotificationHandler";
import redisPublisher from "./redis-db/RedisPublisher";
import RedisPublish from "./redis-db/RedisPublisher";
import mainRedisClient from "./redis-db/mainRedisClient";

export type ClientInfo = {
    statusNotification?: StatusNotification
}

export default class OcppClientManager {

    _list: Array<any> = [];
    _clientInfo: { [key: string]: ClientInfo } = {};

    clientByIdentity(id: string) {
        return this._list.filter(el => { return el.identity === id })[0];
    }

    removeClient(id: string) {
        let index = this._list.findIndex(el => el.identity === id);
        if (index === -1) {
            Logger.log("ClientManager", "Tried removing non-existing client. ID:" + id);
        } else {
            this._list.splice(index, 1);
            Logger.log("ClientManager", "No proper client cleanup");
        }
    }

    clientExists(client: any) {
        return this.clientByIdentity(client.identity) !== undefined;
    }

    getClientIds() {
        return this._list.map(client => client.identity);
    }

    add(client: any) {
        if (this.clientExists(client)) {
            Logger.log("ClientManager", "Client with duplicate id connected - ID:" + client.identity);
            this.removeClient(String(client.identity));
        }
        this._list.push(client);
    }

    updateClientInfo(clientIdentity: string, info: any) {
        if (this._clientInfo[clientIdentity]) {
            this._clientInfo[clientIdentity] = {
                ...this._clientInfo[clientIdentity],
                ...info
            }
        } else {
            this._clientInfo[clientIdentity] = { ...info };
        }
        redisPublisher.clientInfoUpdated(this.getClientInfo(clientIdentity));
    }
    getClientInfo(clientIdentity?:string): Array<ClientInfo> {
        let fullInfo = [];
        if(!clientIdentity){
            for(const key of Object.keys(this._clientInfo)){
                const clientInfo = this._clientInfo[key];
                fullInfo.push({
                    "ocppIdentity": key,
                    ...clientInfo
                })
            }
        }else{
            const clientInfo = this._clientInfo[clientIdentity] ? this._clientInfo[clientIdentity] : {};
            fullInfo.push({
                "ocppIdentity": clientIdentity,
                ...clientInfo
            })
        }
        return fullInfo;
    }
}