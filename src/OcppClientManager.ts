import Logger from "./logs/Logger";

export default class OcppClientManager{

    _list:Array<any> = [];

    clientById(id:string){
        return this._list.filter( el => {return el.identity === id} )[0];
    }

    removeClient(id:string){
        let index = this._list.findIndex( el => el.identity === id);
        if(index === -1){
            Logger.log("Tried removing non-existing client. ID:"+id);
        }else{
            this._list.splice(index, 1);
            Logger.log("!No proper client cleanup");
        }
    }

    clientExists(client:any){
        return this.clientById(client.identity) !== undefined;
    }

    add(client:any){
        if(this.clientExists(client)){
            Logger.log("!!! - Client with duplicate id connected. ID:" + client.identity);
            this.removeClient(String(client.identity));
        }
        this._list.push(client);
    }
}