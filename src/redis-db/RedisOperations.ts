import { RedisClientType } from "./RedisClient";

export default class RedisOperations{
    static async updateOcppClientInfo(redisClient:RedisClientType, ocppClient:any, info:any){
        return redisClient.set(`OcppClient:info:${ocppClient.identity}`, info);
    }
    static async getOcppClientStatus(redisClient:RedisClientType, ocppClientId:string){
        return redisClient.get(`OcppClient:status:${ocppClientId}`);
    }
}