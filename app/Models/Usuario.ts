import Hash from "@ioc:Adonis/Core/Hash";
import {
  BaseModel,
  beforeSave,
  column, belongsTo, BelongsTo
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresas from "./Empresa";

export default class Usuario extends BaseModel {

  @column({ isPrimary: true })
  public id: number;

  @column()
  public empresa_id: number;

  @column()
  public nome: string;

  @column()
  public email: string;

  @column()
  public telefone: string;
  
  @column({ serializeAs: null })
  public password: string;

  @column()
  public ativo: boolean;

  @column()
  public nivel: string;


  @column()
  public remember_me_token?: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @beforeSave()
  public static async hashPassword(usuario: Usuario) {
    console.log('Senha Antes', usuario);
    
    if (usuario.$dirty.password) {
      usuario.password = await Hash.make(usuario.password);
      console.log('Senha dirty ', usuario.$dirty.password);
      console.log('Senha depois ', usuario.password);
    }
  }

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime;

  @belongsTo(() => Empresas)
  public empresa: BelongsTo<typeof Empresas>;

}
