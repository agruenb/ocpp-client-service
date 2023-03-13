import type { RedisClientType } from 'redis';
const redis = require('redis');

export default class OcppServerMessageHandler{

    attachTo(client:RedisClientType){
        client.on('error', (err:Error) => console.log('Redis Client Error', err));
        
        client.on('connect', () => {
            console.log('Connected to Redis Server');
        });

        const listener = (message:string, channel:string) => console.log(message, channel);
        client.on('ready', () => {
            if(process.env.REDIS_MESSAGE_CHANNEL_NAME === undefined) 
                throw new Error("Missing definition in .env file");
            return client.subscribe(process.env.REDIS_MESSAGE_CHANNEL_NAME, listener);
        });
    }

    
}