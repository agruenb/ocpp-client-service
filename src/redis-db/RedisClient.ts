import Logger from '../logs/Logger';
import { createClient } from 'redis';

export type RedisClientType = ReturnType<typeof createClient>

export default function setUpRedis():RedisClientType{
    let redis_client = createClient({
        password: process.env.REDIS_SERVER_PASSWORD,
        socket: {
            host: process.env.REDIS_SERVER_URI,
            port: parseInt(process.env.REDIS_SERVER_PORT || "")
        }
    });
    redis_client.on('error', err => Logger.error("RedisClient", "Redis error", err));
    redis_client.on('connect', () => Logger.log("RedisClient", "Connected"));
    //test redis
    /* let pub_client = redis_client.duplicate();
    pub_client.connect();
    setTimeout(()=>{
        pub_client.publish('server_commands:ocpp_service', 'message');
    }, 3000); */
    redis_client.connect();

    return redis_client;
}