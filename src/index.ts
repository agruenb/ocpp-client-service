
//@ts-nocheck
import OcppClientMessageHandler from "./OcppClientMessageHandler";
import OcppClientAuthHandler from "./OcppClientAuthHandler";

const { RPCServer } = require("ocpp-rpc");

const server = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: true,
});

const authHandler = new OcppClientAuthHandler();
authHandler.attachTo(server)

OcppClientMessageHandler.attachTo(server);

console.log("Starting server");
server.listen(3000);