export default class StopTransactionHandler{

    _client:any;

    attachTo(client:any){
        this._client = client;
        client.handle('StopTransaction', (params:any) => this.handler(params));
    }
    async handler(params:any){
        
    }
}