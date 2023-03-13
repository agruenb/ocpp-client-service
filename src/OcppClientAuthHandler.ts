const { createRPCError } = require("ocpp-rpc");

export default class OcppClientAuthHandler{

    _idIncrementor = 1;

    attachTo(ocppRpcServer:any):any{
        ocppRpcServer.auth((accept:any, reject:any, handshake:any) => {
    
            // accept the incoming client
            accept({
                sessionId: `${this._idIncrementor++}`
            });
        });
    }
}