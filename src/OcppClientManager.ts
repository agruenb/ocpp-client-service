import Logger from "./logs/Logger";
import BootNotificationHandler, { BootNotification } from "./messageHandlersOcpp16/BootNotificationHandler";
import HearbeatHandler from "./messageHandlersOcpp16/HeartbeatHandler";
import MeterValuesHandler, { MeterValues } from "./messageHandlersOcpp16/MeterValuesHandler";
import StartTransactionHandler, { StartTransaction } from "./messageHandlersOcpp16/StartTransactionHandler";
import StatusNotificationHandler, { StatusNotification } from "./messageHandlersOcpp16/StatusNotificationHandler";
import StopTransactionHandler, { StopTransaction } from "./messageHandlersOcpp16/StopTransactionHandler";
import redisPublisher from "./redis-db/RedisPublisher";
const { createRPCError } = require("ocpp-rpc");

export type ClientInfo = {
    lastSeen: number,
    ocppIdentity?: string,
    statusNotification?: StatusNotification
}

export default class OcppClientManager {

    clientTimeout: number = parseInt(process.env.INITIAL_OCPP_CLIENT_TIMEOUT_SEC || "10")*1000;

    _list: Array<any> = [];
    _clientInfo: { [key: string]: ClientInfo } = {};

    garbageCollector;

    constructor(){
        this.garbageCollector = setInterval(() => {
            let timedOutClients = this.timedOutClients();
            timedOutClients.forEach( (client:any) => {
                Logger.log("ClientManager",`Client ${client.identity} timed out`);
                redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
            });
        }, this.clientTimeout);
    }

    timedOutClients(): Array<any> {
        let now = Date.now();
        return this._list.filter(client => {
            return now - this.getClientInfo(client.identity).lastSeen > this.clientTimeout ;
        })
    }

    clientByIdentity(id: string) {
        return this._list.filter(el => { return el.identity === id })[0];
    }

    removeClient(clientIdentity: string) {
        let index = this._list.findIndex(el => el.identity === clientIdentity);
        if (index === -1) {
            Logger.log("ClientManager", "Tried removing non-existing client. ID:" + clientIdentity);
        } else {
            this._list.splice(index, 1);
            delete this._clientInfo.clientIdentity;
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
        this.setupMsgHandlers(client);
        //add client to list
        if (this.clientExists(client)) {
            Logger.log("ClientManager", "Client with duplicate id connected - ID:" + client.identity);
            this.removeClient(String(client.identity));
        }
        this._list.push(client);
        //publish new client
        this.updateClientInfo(client.identity, {
            ocppIdentity: client.identity,
            lastSeen: Date.now()
        });
    }
    setupMsgHandlers(client:any){
        let bootNotificationHandler = new BootNotificationHandler();
        bootNotificationHandler.attachTo(client);
        bootNotificationHandler.on("msg", (bootNotification:BootNotification) => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        let heartbeatHandler = new HearbeatHandler();
        heartbeatHandler.attachTo(client);
        heartbeatHandler.on("msg", () => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        let meterValuesHandler = new MeterValuesHandler();
        meterValuesHandler.attachTo(client);
        meterValuesHandler.on("msg", (meter:MeterValues) => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        let startTransactionHandler = new StartTransactionHandler();
        startTransactionHandler.attachTo(client);
        startTransactionHandler.on("msg", (startTransaction:StartTransaction) => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        let statusNotificationHandler = new StatusNotificationHandler();
        statusNotificationHandler.attachTo(client);
        statusNotificationHandler.on("msg", (statusNote:StatusNotification) => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            this.updateClientInfo(client.identity, {statusNotification: statusNote});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        let stopTransactionHandler = new StopTransactionHandler();
        stopTransactionHandler.attachTo(client);
        stopTransactionHandler.on("msg", (stopTransaction:StopTransaction) => {
            this.updateClientInfo(client.identity, {lastSeen: Date.now()});
            redisPublisher.clientInfoUpdated([this.getClientInfo(client.identity)]);
        });

        client.handle('callError', ({ params }: any) => {
            console.log(`Server got error from ${client.identity}:`, params);
        });

        
        client.handle(({ method, params }: any) => {
            // This handler will be called if the incoming method cannot be handled elsewhere.
            console.log(`Server got ${method} from ${client.identity}:`, params);
            throw createRPCError("NotImplemented");
        });
    }

    updateClientInfo(clientIdentity: string, info: {[key: string]: any}) {
        this._clientInfo[clientIdentity] = {
            ...this._clientInfo[clientIdentity],
            ...info
        }
    }
    getClientInfo(clientIdentity: any): ClientInfo {
        return this._clientInfo[clientIdentity];
    }
    getAllClientInfo(): ClientInfo[] {
        return Object.keys(this._clientInfo).map( (key:string) => {
            return this._clientInfo[key];
        });
    }
}