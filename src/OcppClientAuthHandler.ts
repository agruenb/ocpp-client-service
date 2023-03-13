import { DbModelConnectors } from "./db/src/DbModelConnectors";
import Logger from "./logs/Logger";
import OcppServerMessageHandler from "./OcppServerMessageHandler";

const { createRPCError } = require("ocpp-rpc");

export default class OcppClientAuthHandler{

    _idIncrementor = 1;
    _serverMessageHandler:OcppServerMessageHandler;

    constructor(serverMessageHandler:OcppServerMessageHandler){
        this._serverMessageHandler = serverMessageHandler
    }

    attachTo(ocppRpcServer:any):any{
        ocppRpcServer.auth((accept:any, reject:any, handshake:any) => {
            this.authorize(accept, reject, handshake);
        });
    }
    async authorize(accept:Function, reject:Function, handshake:any){
        Logger.log("Incoming request...");
        let connector = await DbModelConnectors.readById(handshake.identity);
        if (connector !== undefined && connector.password === handshake.password.toString('utf8')){
            Logger.log("Accepted incoming request");
            accept({
                sessionId: `${this._idIncrementor++}`
            });
        }else{
            Logger.log("Rejected Incoming Request: Unauthorized");
            reject(401)
        }
    }
}