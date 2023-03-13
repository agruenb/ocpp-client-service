import BootNotificationHandler from "./messageHandlersOcpp16/BootNotificationHandler";
import HearbeatHandler from "./messageHandlersOcpp16/HeartbeatHandler";

const { createRPCError } = require("ocpp-rpc");

export default class OcppClientMessageHandler{
    static attachTo(ocppRpcServer:any):any{
        ocppRpcServer.on('client', async (client:any) => {
            console.log(`New connection with sessionId:${client.session.sessionId} connected!`);
        
            (new BootNotificationHandler).attachTo(client);

            (new HearbeatHandler).attachTo(client);
            
            // create a specific handler for handling StatusNotification requests
            client.handle('StatusNotification', ({params}:any) => {
                console.log(`Server got StatusNotification from ${client.identity}:`, params);
                return {};
            });
        
            // create a wildcard handler to handle any RPC method
            client.handle(({method, params}:any) => {
                // This handler will be called if the incoming method cannot be handled elsewhere.
                console.log(`Server got ${method} from ${client.identity}:`, params);
        
                // throw an RPC error to inform the server that we don't understand the request.
                throw createRPCError("NotImplemented");
            });
        });
        console.log("Attached");
    }
}