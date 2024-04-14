import { BaseModel, HasMany, column, hasMany, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresa from "./Empresa";



export default class Juizado extends BaseModel {

    @column({ isPrimary: true })
    public id: number;

    @column()
    public empresa_id: number;

    @column()
    public nomejuizado: string; 

    @column()
    public comarca: string;

    @column()
    public endereco: string;

    @column()
    public telefone: string;

    @column()
    public email: string;

    @column()
    public observacao: string;
    

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;
  
    @belongsTo(() => Empresa)
    public empresa: BelongsTo<typeof Empresa>;

}
