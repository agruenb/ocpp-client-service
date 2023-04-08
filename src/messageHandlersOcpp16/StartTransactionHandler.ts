import { DbModelStartTransaction } from "../db/src/DbModelStartTransaction";

export default class StartTransactionHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('StartTransaction', (params:any) => this.handler(params));
    }
    async handler(params:any){
        let transaction = await DbModelStartTransaction.create(this._client.identity, 0, "fakeTag", 303, (new Date()).toISOString());
        params.reply({
            transactionId: transaction.id,
            idTagInfo: {
                status: "Accepted",
                expiryDate: "2023-09-22T12:10:38.736Z"
            }
        });
    }
}