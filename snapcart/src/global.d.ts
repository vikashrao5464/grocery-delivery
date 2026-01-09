import { Connection } from "mongoose";

declare global{
  var mongoose:{
    conn:Connecton | null;
    promise:Promise<Connection> | null;
  }
}
export {};