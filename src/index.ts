
//@ts-nocheck
import OcppClientMessageHandler from "./OcppClientMessageHandler";
import OcppClientAuthHandler from "./OcppClientAuthHandler";
import OcppClientManager from "./OcppClientManager";
import OcppServerMessageHandler from "./OcppServerMessageHandler";
import type { RedisClientType } from 'redis';
const redis = require('redis');
const { RPCServer } = require("ocpp-rpc");

let redis_client:RedisClientType = redis.createClient({
    password: process.env.REDIS_SERVER_PASSWORD,
    socket: {
        host: process.env.REDIS_SERVER_URI,
        port: process.env.REDIS_SERVER_PORT
    }
});
const ocppServerMessageHandler = new OcppServerMessageHandler();
ocppServerMessageHandler.attachTo(redis_client);
redis_client.connect();
//test redis
/* let pub_client = redis_client.duplicate();
pub_client.connect();
setTimeout(()=>{
    pub_client.publish('server_commands:ocpp_service', 'message');
}, 3000); */


const server = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: true,
});

export const OcppClientsManager = new OcppClientManager();

const authHandler = new OcppClientAuthHandler();
authHandler.attachTo(server)

OcppClientMessageHandler.attachTo(server);

console.log("Starting server");
server.listen(3000);