import { RedisClientType } from "./RedisClient";

export default class RedisOperations{
    static async updateOcppClientStatus(redisClient:RedisClientType, ocppClient:any, status:string){
        return redisClient.set(`OcppClient:status:${ocppClient.identity}`, status);
    }
    static async getOcppClientStatus(redisClient:RedisClientType, ocppClientId:string){
        return redisClient.get(`OcppClient:status:${ocppClientId}`);
    }
}