import BootNotificationHandler from "./messageHandlersOcpp16/BootNotificationHandler";
import HearbeatHandler from "./messageHandlersOcpp16/HeartbeatHandler";
import ocppClientsManager from "./mainClientManager";
import StartTransactionHandler from "./messageHandlersOcpp16/StartTransactionHandler";
import StatusNotificationHandler from "./messageHandlersOcpp16/StatusNotificationHandler";

const { createRPCError } = require("ocpp-rpc");

export default class OcppClientMessageHandler {
    attachTo(ocppRpcServer: any): any {
        ocppRpcServer.on('client', async (client: any) => {
            ocppClientsManager.add(client);

            (new BootNotificationHandler).attachTo(client);

            (new HearbeatHandler).attachTo(client);

            (new StartTransactionHandler).attachTo(client);

            (new StatusNotificationHandler).attachTo(client);

            // create a specific handler for handling StatusNotification requests
            client.handle('callError', ({ params }: any) => {
                console.log(`Server got error from ${client.identity}:`, params);
            });

            client.handle("StopTransaction", (obj: any) => {
                console.log("--- Allow stop ---");
                return {
                    idTagInfo: {
                        status: "Accepted"
                    }
                }
            });

            // create a wildcard handler to handle any RPC method
            client.handle(({ method, params }: any) => {
                // This handler will be called if the incoming method cannot be handled elsewhere.
                console.log(`Server got ${method} from ${client.identity}:`, params);

                // throw an RPC error to inform the server that we don't understand the request.
                throw createRPCError("NotImplemented");
            });
        });
    }
}