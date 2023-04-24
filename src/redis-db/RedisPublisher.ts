import { ClientInfo } from "../OcppClientManager";
import { StartTransaction } from "../messageHandlersOcpp16/StartTransactionHandler";
import { StopTransaction } from "../messageHandlersOcpp16/StopTransactionHandler";
import { RedisClientType } from "./RedisClient";
import mainRedisClient from "./mainRedisClient";

class RedisPublish {

    _redisClient: RedisClientType;

    constructor(redisClient: RedisClientType) {
        this._redisClient = redisClient.duplicate();
        this._redisClient.on('error', err => console.error("[RedisPublisher]", "Redis error", err));
        this._redisClient.on('connect', () => console.log("[RedisPublisher]", "Connected"));
    }

    async connect() {
        await this._redisClient.connect();
    }

    async clientInfoUpdated(clientInfos: Array<ClientInfo>) {
        return await this._redisClient.publish(`ClientInfo:Updated`, JSON.stringify(clientInfos));
    }
    async transactionStarted(startedTransactions: Array<StartTransaction>) {
        return await this._redisClient.publish(`Transaction:Started`, JSON.stringify(startedTransactions));
    }
    async transactionStopped(stoppedTransactions: Array<StopTransaction>) {
        return await this._redisClient.publish(`Transaction:Stopped`, JSON.stringify(stoppedTransactions));
    }
}
const redisPublisher = new RedisPublish(mainRedisClient);
redisPublisher.connect();
export default redisPublisher;