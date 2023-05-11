import { FromSchema } from "json-schema-to-ts";
import { DbModelTransaction } from "../db/src/DbModelTransactions";
import redisPublisher from "../redis-db/RedisPublisher";
import EventEmitter from "events";

const StartTransactionJson = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "urn:OCPP:1.6:2019:12:StartTransactionRequest",
    "title": "StartTransactionRequest",
    "type": "object",
    "properties": {
        "connectorId": {
            "type": "integer"
        },
        "idTag": {
            "type": "string",
            "maxLength": 20
        },
        "meterStart": {
            "type": "integer"
        },
        "reservationId": {
            "type": "integer"
        },
        "timestamp": {
            "type": "string",
            "format": "date-time"
        }
    },
    "additionalProperties": false,
    "required": [
        "connectorId",
        "idTag",
        "meterStart",
        "timestamp"
    ]
} as const;

export type StartTransaction = FromSchema<typeof StartTransactionJson>;

export default class StartTransactionHandler extends EventEmitter {

    _client: any;

    attachTo(client: any) {
        this._client = client;
        client.handle('StartTransaction', (params: any) => this.handler(params));
    }
    async handler(msg: any) {
        let data:StartTransaction = msg.params;
        let transaction = await DbModelTransaction.createStarted(this._client.identity, 0, "fakeTag", data.meterStart, (new Date()).toISOString());
        msg.reply({
            transactionId: transaction.id,
            idTagInfo: {
                status: "Accepted",
                expiryDate: "2023-09-22T12:10:38.736Z"
            }
        });
        let startTransaction: StartTransaction = msg.params;
        let info = {
            transactionId: transaction.id,
            ocppIdentity: this._client.identity
        }
        redisPublisher.transactionStarted([info], [startTransaction]);
        this.emit("msg", transaction);
    }
}