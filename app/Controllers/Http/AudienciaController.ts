import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Usuario from "App/Models/Usuario";
import Processo from "App/Models/Processo";
import { DateTime } from "luxon";
import Cliente from "App/Models/Cliente";
import Audiencia from "App/Models/Audiencia";

export default class AudienciaController {
    public async index({ view, auth }: HttpContextContract) {
    
        const idEmpresa = auth.user?.empresa_id;
        const nomeEmpresa = await Empresa.query()
            .where('id', '=', Number(idEmpresa))
            .select('fantasia');
        
            const objAudiencia = {
                id: 0,
                processo: '',
                dataaudiencia: null,
                obervacao: '',
                realizado: '',
                empresa_id: Number(idEmpresa),
                cliente_id: 0,
            }


        const listAudiencia = await Audiencia.query()
            .select("audiencias.*")  
            .select("clientes.nome as nomeCliente")
            .select("tribunals.nome as nomeJuizado")
            .select("tribunals.comarca")
            .select("tribunals.endereco")
            .select("processos.nomejuiz")
            .select("processos.vara")
            .join("clientes", "clientes.id", "=", "audiencias.cliente_id")
            .join("processos", "processos.numeroprocesso", "=", "audiencias.processo")
            .join("tribunals", "tribunals.id", "=", "processos.tribunal_id")
            .where("audiencias.empresa_id", "=", Number(idEmpresa))
    
        const clientes = await Cliente.query()
            .where("empresa_id", "=", Number(idEmpresa))
            .orderBy("nome", "asc");
    
        const empresas = await Empresa.query()
            .select('empresas.fantasia')
            .select('empresas.logo')
            .where('empresas.id', '=', Number(auth.user?.empresa_id));
    
        return view.render("audiencia", {
          nomeEmpresa,
          listAudiencia,
          objAudiencia,
          clientes,
          empresas,
          
        });

    }

}