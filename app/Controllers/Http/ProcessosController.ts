import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Usuario from "App/Models/Usuario";
import Processo from "App/Models/Processo";
import Tribunal from "App/Models/Tribunal"
import Estatus from "App/Models/Estatuses";

import { DateTime } from "luxon";
import moment from "moment";
import Cliente from "App/Models/Cliente";


export default class ProcessosController {

  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id;
    const nomeEmpresa = await Empresa.query()
    .where('id', '=', Number(idEmpresa))
    .select('fantasia');


    const tribunais = await Tribunal.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("nome", "asc");

    const estatus = await Estatus.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("descricao", "asc");

    const clientes = await Cliente.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("nome", "asc");

    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(auth.user?.empresa_id));

    const objProcesso = {
      id: 0,
      empresa_id: Number(idEmpresa),
      numeroprocesso: "",
      datacontratacao: DateTime.now(),
      descricaoacao: "",
      nivelprocesso: "",
      nomejuiz: "",
      audiencia: null,
      conclusao: null,
      linkprocesso: "",
      senhaprocesso: "",
      vara: "",
      obs: "",
      cliente_id: 0,
      tribunal_id: 0,
      estatus_id: 0,
      
    };

    return view.render("processos", {
      tribunais,
      estatus,
      clientes,
      objProcesso,
      nomeEmpresa,
      empresas
    });
  }

  public async edit({ view, params, auth }: HttpContextContract) {
    
    const objProcesso = await Processo.findOrFail(params.id)
    
    const clientes = await Cliente.query()
    .where('clientes.empresa_id', '=', Number(auth.user?.empresa_id) )
    .orderBy("nome", "asc");

    const tribunais = await Tribunal.query()
    .where("tribunals.empresa_id", "=", Number(auth.user?.empresa_id) )
    .orderBy("nome", "asc");

    const estatus = await Estatus.query()
    .where("estatuses.empresa_id", "=", Number(auth.user?.empresa_id) )
    .orderBy("descricao", "asc");
    
     return view.render("processos", {
      tribunais, estatus, clientes, objProcesso,
    });

  }

  public async create({ request, response, session, auth }: HttpContextContract) {
    
    try {
      const validationSchema = schema.create({
        numeroprocesso: schema.string(),
      });

      const validateData = await request.validate({ schema: validationSchema });

      if (request.input("id") === "0") {
        await Processo.create({
          numeroprocesso: validateData.numeroprocesso,
          
          datacontratacao: request.input('datacontratacao') !== undefined && request.input('datacontratacao') !== null
          ? request.input('datacontratacao') : null,

          descricaoacao: request.input('descricaoacao') === null ? '' : request.input('descricaoacao').toUpperCase(),
          nivelprocesso: request.input('nivelprocesso') === null ? '' : request.input('nivelprocesso').toUpperCase(),

          audiencia: request.input('audiencia') !== undefined && request.input('audiencia') !== null
          ? request.input('audiencia') : null,

          linkprocesso: request.input('linkprocesso') === null ? '' : request.input('linkprocesso').toLowerCase(),
          nomejuiz: request.input('nomejuiz') === null ? '' : request.input('nomejuiz').toUpperCase(),
          senhaprocesso: request.input('senhaprocesso'),
          vara: request.input('vara'),
          obs: request.input('obs'),
          empresa_id: auth.user?.empresa_id,
          cliente_id: request.input('cliente_id'),
          tribunal_id: request.input('tribunal_id'),
          estatus_id: request.input('estatus_id'),
          conclusao: request.input('conclusao') !== undefined && request.input('conclusao') !== null
          ? request.input('conclusao') : null,

        });

        session.flash("notification", "Processo criado com sucesso!");
        return response.redirect("/processos");
      } else {

          const processo = await Processo.findOrFail(request.input("id"));
          processo.numeroprocesso = validateData.numeroprocesso,

          processo.datacontratacao = request.input('datacontratacao') !== undefined && request.input('datacontratacao') !== null
          ? request.input('datacontratacao') : null,

          processo.descricaoacao= request.input('descricaoacao') === null ? '' :request.input('descricaoacao').toUpperCase(),
          processo.nivelprocesso= request.input('nivelprocesso'),

          processo.audiencia = request.input('audiencia') !== undefined && request.input('audiencia') !== null
          ? request.input('audiencia') : null,
          
          /*processo.primeiraaudiencia = request.input('primeiraaudiencia') !== undefined && request.input('primeiraaudiencia') !== null
          ? request.input('primeiraaudiencia') : null,
          */

          processo.linkprocesso= request.input('linkprocesso') === null ? '' : request.input('linkprocesso').toLowerCase(),
          processo.nomejuiz= request.input('nomejuiz') === null ? '' : request.input('nomejuiz').toUpperCase(),
          processo.senhaprocesso= request.input('senhaprocesso'),
          processo.vara= request.input('vara'),
          processo.obs= request.input('obs'),
          processo.cliente_id= request.input('cliente_id'),
          processo.tribunal_id= request.input('tribunal_id'),
          processo.estatus_id= request.input('estatus_id'),
          processo.conclusao= request.input('conclusao'),
        await processo.save();

        session.flash("notification", "Processo alterado com sucesso!");
        
        return response.redirect("/processos");

      }
      
      

    } catch (error) {
      console.log("Error:", error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }
    return response.redirect("back");
  }

  public async finalize({ view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const pessoas = await Usuario.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");


    return view.render("ordemServico", {
      empresas,
      pessoas,

    });
  }

  public async cancela({ response }: HttpContextContract) {
    
    return response.redirect("back");
  }

  public async filtro({ request, view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id;
    const nomeEmpresa = await Empresa.query()
    .select('fantasia')
    .select('razaosocial')
    .select('logo')
    .where('id', '=', Number(idEmpresa));
    
  
    const tribunais = await Tribunal.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("nome", "asc");
  
    const estatus = await Estatus.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("descricao", "asc");
    
    let nomeCliente = '';
    
    const clientes = await Cliente.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .where((query) =>{
      if (request.input("cliente") !== null){
        query.where('id', '=', request.input("cliente"));
      }
    })
    .orderBy("nome", "asc");

    nomeCliente = clientes.length == 1 ? clientes[0].nome : '';

   const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(idEmpresa));
  
    const page = request.input("page", 1);
    const limit = 50;

    
    
  const processos = await Processo.query()
    .select("processos.*")  
    .select("clientes.nome as nomeCliente")
    .select("tribunals.nome")
    .select("estatuses.descricao")
    .join("clientes", "clientes.id", "=", "processos.cliente_id")
    .join("tribunals", "tribunals.id", "=", "processos.tribunal_id")
    .join("estatuses", "estatuses.id", "=", "processos.estatus_id")
    .where("processos.empresa_id", "=", Number(idEmpresa))
    .where((query) => {
        if (request.input("cliente") !== null){
          query.where("processos.cliente_id", "=", Number(request.input("cliente")))
        }

        if (request.input("tribunal") !== null) {
          query.where("processos.tribunal_id", "=", Number(request.input("tribunal")))
        }

        if (request.input("processo") !== null ){
          query.andWhereILike("processos.numeroprocesso", "%" + request.input("processo") + "%")
        }

        if (request.input("status") !== null) {
          query.where("processos.estatus_id", "=", request.input("status"))
        }
      })
      
      .orderBy("clientes.nome", "asc")
      .paginate(page, limit);

    processos.baseUrl("lista");

    nomeCliente = nomeCliente == '' ? 'Todos Clientes' : nomeCliente;

    return view.render("listaProcesso", {
      processos,
      clientes,
      tribunais,
      estatus,
      nomeEmpresa,
      empresas,
      nomeCliente,
    });

    
  }

 
public async listar({ request, view, auth }: HttpContextContract) {

  const idEmpresa = auth.user?.empresa_id;
  const nomeEmpresa = await Empresa.query()
  .select('fantasia')
  .select('razaosocial')
  .where('id', '=', Number(idEmpresa));
  

  const tribunais = await Tribunal.query()
  .where("empresa_id", "=", Number(idEmpresa))
  .orderBy("nome", "asc");

  const estatus = await Estatus.query()
  .where("empresa_id", "=", Number(idEmpresa))
  .orderBy("descricao", "asc");

  const clientes = await Cliente.query()
  .where("empresa_id", "=", Number(idEmpresa))
  .orderBy("nome", "asc");

  const empresas = await Empresa.query()
  .select('empresas.fantasia')
  .select('empresas.logo')
  .where('empresas.id', '=', Number(idEmpresa));

  const page = request.input("page", 1);
  const limit = 50;
  
  const processos = await Processo.query()
    .select("processos.*")  
    .select("clientes.nome as nomeCliente")
    .select("tribunals.nome")
    .select("estatuses.descricao")
    .join("clientes", "clientes.id", "=", "processos.cliente_id")
    .join("tribunals", "tribunals.id", "=", "processos.tribunal_id")
    .join("estatuses", "estatuses.id", "=", "processos.estatus_id")
    .orderBy("clientes.nome", "asc")
    .where("processos.empresa_id", "=", Number(idEmpresa))
    .paginate(page, limit);

  processos.baseUrl("lista");

  console.log(processos)

  return view.render("listaProcesso", {
    processos,
    clientes,
    tribunais,
    estatus,
    nomeEmpresa,
    empresas,
  });
    
  }

  

  /**
   * Retorna um DateTime Luxon
   */
  public convertStrToDateTime(dataInput: string): any {
    const dataLuxon = DateTime.fromISO(dataInput);
    //const dataLuxon = DateTime.fromISO(dataInput, {zone: 'utc'});
    return dataLuxon;
  }

  public normalizaNomeImagem(value: string): string {
    return (
      moment().format("DDMMYYYY") +
      "_" +
      value.normalize("NFD").split(" ").join("")
    );
  }
}
