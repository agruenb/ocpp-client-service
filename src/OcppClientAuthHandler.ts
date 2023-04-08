import { DbModelStations } from "./db/src/DbModelStations";
import Logger from "./logs/Logger";
import OcppServerMessageHandler from "./ServerMessageQueueHandler";

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
        if(!handshake.identity){
            Logger.log("ClientAuth", "Client without identity");
            reject(401);
            return;
        }
        let station = await DbModelStations.readByOcppIdentity(handshake.identity);
        if(!station){
            Logger.log("ClientAuth", `Client with unknown identity (${handshake.identity})`);
            reject(401);
            return;
        }
        accept({
            sessionId: `${this._idIncrementor++}`
        });
    }
}