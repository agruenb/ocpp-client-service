export default class Logger{
    static log(source:string, message:string){
        if(process.env.NODE_ENV === "development"){
            console.log(`[${source}] ${message}`);
        }else{
            return;
        }
    }
    static error(source:string, message:string, error:any){
        if(process.env.NODE_ENV === "development"){
            Logger.log(source, message);
            console.log(error);
        }else{
            return;
        }
    }
}