import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Empresa from "App/Models/Empresa";
import Pessoa from "App/Models/Usuario";
import Tarefa from "App/Models/Processo";

import ClienteSacador from 'App/Models/Cliente';

//import Grupo from "App/Models/Estatus";

export default class HomeController {
  public async index({ request, view, auth }: HttpContextContract) {

    let idUserLogado: any = 0;
    let idEmpresaLogada : any = 0;
    let nivel : any = 9;
    

    if (auth.user){
      idUserLogado = auth.user.id;
      idEmpresaLogada = auth.user.empresa_id;
      nivel = auth.user.nivel;
    }

    const addPessoas = await Pessoa.query()
      .where('nivel', '=', '')  
     .orderBy("nome");

    console.log('id empresa.:', idEmpresaLogada);

    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .where('empresas.id', '=', idEmpresaLogada);

    //HomeController.baseUrl("/home");

    console.log('Empresas ', empresas[0].fantasia);

    return view.render("home/index", {
      empresas,
      addPessoas,
      nivel,
      auth,
      
    });
  }

  public async filter({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();


    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const page = request.input("page", 1);
    const limit = 50;

    const empDestino = request.input("empDestino");
    const usuDestino = request.input("usuDestino");
    const dataInicial = request.input("dataInicial");
    const dataFinal = request.input("dataFinal");
    const depDestino = request.input("depTarefa");

    const tarefas = await Tarefa.query()
      .join("empresas", "empresas.id", "=", "tarefas.emp_destino")
      .join("pessoas", "pessoas.id", "=", "tarefas.usu_destino")
      .join("departamentos", "departamentos.id", "=", "tarefas.dep_destino")
      .join("grupos", "grupos.id", "=", "empresas.grupo_id")

      .where((query) => {
        if (empDestino !== null) {
          query.andWhere("empDestino", empDestino);
        }
        if (usuDestino !== null) {
          query.andWhere("usuDestino", usuDestino);
        }
        if (dataInicial !== null && dataFinal !== null) {
          query.andWhereBetween("dataOrigem", [
            dataInicial + " 00:00:00",
            dataFinal + " 23:59:59",
          ] );
        }
      /*
        if (statusTarefa !== null) {
          query.andWhere("statusTarefa", statusTarefa);
        }
      */
        if (depDestino !== null ) {
          query.andWhere("dep_destino", depDestino)

        }
      })
      .select("tarefas.*")
      .select("empresas.razao_social")
      .select("pessoas.name")
      .select("departamentos.nome")
      .select("grupos.nome")

      .orderBy("data_conclusao", "asc")
      .orderBy("prioridade", "asc")
      .orderBy("data_previsao", "asc")
      .paginate(page, limit);

    const addPessoas = await Pessoa.query()
      .where({ ativo: false, desligado: false })
      .orderBy("name");

      const tarPrioridade1 = await Tarefa.query()
        .select("tarefas.prioridade")
        .count("tarefas.prioridade", "quantidade")
        .where("prioridade", "1")
        .andWhereNull("tarefas.data_conclusao");

       const tarPrioridade2 = await Tarefa.query()
       .select("tarefas.prioridade")
       .count("tarefas.prioridade", "quantidade")
       .where("prioridade", "2")
       .andWhereNull("tarefas.data_conclusao")
       .groupBy("tarefas.prioridade");

       const tarPrioridade3 = await Tarefa.query()
          .select("tarefas.prioridade")
          .count("tarefas.prioridade", "quantidade")
          .where("prioridade", "3")
          .andWhereNull("tarefas.data_conclusao")
          .groupBy("tarefas.prioridade");
      //Fim da Consulta

        //Total de Usuarios Ativos
      const totalUsuarios = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .count("pessoas.id", "qnt");


        //Total Tarefas Ativas
      const totalTarefas = await Tarefa.query()
      .andWhereNull("tarefas.data_conclusao")
      .count("tarefas.id", "qnt");

    

    tarefas.baseUrl("/home");
    

    return view.render("home/index", {
      tarefas,
      addPessoas,
      pessoas,
      empresas,
      
      
      tarPrioridade1,
      tarPrioridade2,
      tarPrioridade3,
      totalUsuarios,
      totalTarefas
    });
  }

  public async filterOS({ request, view, auth }: HttpContextContract) {

    let idUserLogado: any = 0;
    let cargoUserLogado: number = 0;

    if (auth.user){
      idUserLogado = auth.user.id;
      //cargoUserLogado = auth.user.cargo;
    }

    const grupos = await Grupo.all();
    const empresas = await Empresa.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const pageOS = request.input("pageOS", 1);
    const limitOS = 50;

    const page = request.input("page", 1);
    const limit = 50;
    
    const grupo = request.input("grupo");
    const empDestino = request.input("empDestino");
    const dataInicial = request.input("dataInicial");
    const dataFinal = request.input("dataFinal");
    const statusOS = request.input("statusOS");

    const consGrupo = await Grupo.query()
    .where('grupos.id', '=', grupo)
    .select('grupos.nome');

    const consEmpresas = await Empresa.query()
    .where('empresas.id', '=', empDestino)
    .select('empresas.razao_social');

/*
    const ordensServicos = await OrdemServico.query()
      .join("empresas", "empresas.id", "=", "ordens_servicos.emp_destino")
      .join("grupos", "grupos.id", "=", "empresas.grupo_id")
      
      .where((query) => {
        if (grupo !== null ) {
          query.andWhere("empresas.grupo_id", grupo);
        }
        if (empDestino !== null) {
          query.andWhere("empDestino", empDestino);
        }
        if (dataInicial !== null && dataFinal !== null) {
          query.andWhereBetween("dataOrigem", [
            dataInicial + " 00:00:00",
            dataFinal + " 23:59:59",
          ] );
        }

        if (statusOS !== null) {
          query.andWhere("statusOrdemServico", statusOS);
        }

        if (idUserLogado !== 0 && cargoUserLogado !== 1){
          query.andWhere("usuOrigem", "=", idUserLogado)
        }

      })

      .select("ordens_servicos.*")
      .select("empresas.razao_social")
      .select("grupos.nome")
      .orderBy("data_conclusao", "asc")
      .paginate(pageOS, limitOS);

      console.log("OrdemServico ", ordensServicos);

      /**Criar somatoria  
      var totalOrcamento = 0;
      var nomeEmpresa = 'Todas';
      var nomeGrupo = 'Todos';

      if( typeof ordensServicos != 'undefined') {
        for (const chave in Object.values(ordensServicos)) {
          if (ordensServicos.hasOwnProperty(chave)) {
            totalOrcamento = totalOrcamento + ordensServicos[chave].valor;
          }
        }
      }

      if (typeof consGrupo != 'undefined' && consGrupo.length == 1 ) {
        var nomeGrupo = consGrupo[0].nome;
       }
   
       if (typeof consEmpresas != 'undefined' && consEmpresas.length == 1 ) {
          nomeEmpresa = consEmpresas[0].razaoSocial;
       }




    ordensServicos.baseUrl("/home");

    const tarefas = await Tarefa.query()
      .join("empresas", "empresas.id", "=", "tarefas.emp_destino")
      .join("pessoas", "pessoas.id", "=", "tarefas.usu_destino")
      .join("departamentos", "departamentos.id", "=", "tarefas.dep_destino")
      .join("grupos", "grupos.id", "=", "empresas.grupo_id")
      
      .select("tarefas.*")
      .select("empresas.razao_social")
      .select("pessoas.name")
      .select("departamentos.nome")
      .select("grupos.nome")

      .whereNot("status_tarefa", "Completo" )
      .andWhereNot("status_tarefa", "Cancelado" )
      .orderBy("data_conclusao", "asc")
      .orderBy("prioridade", "asc")
      .orderBy("data_previsao", "asc")
      .paginate(page, limit);
*/
    //Total Tarefas Ativas
    const totalTarefas = await Tarefa.query()
    .andWhereNull("tarefas.data_conclusao")
    .count("tarefas.id", "qnt");


    const addPessoas = await Pessoa.query()
      .where({ ativo: false, desligado: false })
      .orderBy("name");




    return view.render("home/index", {
      grupos,
      
      empresas,
      pessoas,
      
      totalTarefas,
      addPessoas,
      
      
    });
  }

  public async welcome({ view }: HttpContextContract) {
    return view.render("welcome");
  }
}
