import { ClientInfo } from "../OcppClientManager";
import { RedisClientType } from "./RedisClient";

export default class RedisPublish {

    _redisClient: RedisClientType;

    constructor(redisClient: RedisClientType) {
        this._redisClient = redisClient.duplicate();
    }

    async connect() {
        await this._redisClient.connect();
    }

    async clientInfoUpdated(clientInfo: ClientInfo) {
        return await this._redisClient.publish(`ClientInfo:Updated`, JSON.stringify(clientInfo));
    }
}