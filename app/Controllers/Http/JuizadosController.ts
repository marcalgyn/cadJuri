import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules } from '@ioc:Adonis/Core/Validator';
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Juizados from "App/Models/Juizado";
import Pessoa from "App/Models/Usuario";



export default class TarefaController {
  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id

    const objJuizado = {
      id: 0,
      nomejuizado: "",
      comarca: "",
      endereco: "",
      telefone: "",
      email: "",
      observacao: "",
    };

    const juizados = await Juizados.query()
    .where('empresa_id', '=', Number(idEmpresa))
    .orderBy("nomejuizado", "asc");

    
    return view.render("juizado", { objJuizado, juizados, idEmpresa });
  }

  public async edit({ view, params }: HttpContextContract) {
    
    const objJuizado = await Juizados.findOrFail(params.id);
      
    return view.render("juizado", { objJuizado });
  }

    public async create({ request, response, session, auth }: HttpContextContract) {

    try {
      const validationSchema = schema.create({
        nomejuizado: schema.string({trim: true}, [rules.maxLength(255)]),
        comarca: schema.string({trim: true}),

      });

      const validateData = await request.validate({ schema: validationSchema,
        messages: {
          "nomejuizado.required": "Informe o Juizado",
          "comarca.required": "Informe a comarca",
        }, });

      console.log(validateData);

      if (request.input("id") === "0") {
        await Juizados.create({
          nomejuizado: validateData.nomejuizado,
          comarca: validateData.comarca,
          endereco: request.input('endereco') === 'null' ? '' : request.input('endereco'),
          telefone: request.input('telefone') === 'null' ? '' : request.input('telefone'),
          email: request.input('email') === 'null' ? '' : request.input('email'),
          observacao : request.input('observacao') === 'null' ? '' : request.input('observacao'),
          empresa_id: auth.user?.empresa_id,
        });

        session.flash("notification", "Juizado adicionado com sucesso!");
      
      } else {

        const juizado = await Juizados.findOrFail(request.input("id"));

        juizado.nomejuizado = request.input("nomejuizado");
        juizado.comarca = request.input('comarca');
        juizado.endereco = request.input('endereco');
        juizado.telefone = request.input('telefone');
        juizado.email = request.input('email');
        juizado.observacao = request.input('observacao');
        

        await juizado.save();

        session.flash("notification", "Juizado alterada com sucesso!");
      }

    } catch (error) {
      console.log("Error:", error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }
    return response.redirect('/juizados');

    //return response.redirect("back");
  }

  /*** EDITAR A PARTIR  */
  public async lista({ request, view }: HttpContextContract) {

    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.all();
    const page = request.input("page", 1);
    const limit = 50;

    const tarefas = await Tarefa.query()

      .select("tarefas.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .join("empresas", "empresas.id", "=", "tarefas.emp_destino")
      .join("pessoas", "pessoas.id", "=", "tarefas.usu_destino")
      .join("departamentos", "departamentos.id", "=", "tarefas.dep_destino")
      .andWhere("tarefas.status_tarefa", "Completo")
      .orderBy("data_conclusao", "desc")
      .paginate(page, limit);

    tarefas.baseUrl("lista");

    // parseFloat(tarefas.`valor`)



    return view.render("listatarefa", { tarefas, empresas, departamentos, pessoas });

  }

  public async filtro({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.all();
    const page = request.input("page", 1);
    const limit = 50;
    

    const empDestino = request.input("empDestino");
    const usuDestino = request.input("usuDestino");
    const dataInicial = request.input("dataInicial");
    const dataFinal = request.input("dataFinal");
    const depDestino = request.input("depTarefa");


    const consPessoas = await Pessoa.query()
    .where("pessoas.id", "=", usuDestino)
    .select("pessoas.name");

    const consEmpresas = await Empresa.query()
    .where('empresas.id', '=', empDestino)
    .select('empresas.razao_social');


    const tarefas = await Tarefa.query()
      .join("empresas", "empresas.id", "=", "tarefas.emp_destino")
      .join("pessoas", "pessoas.id", "=", "tarefas.usu_destino")
      .join("departamentos", "departamentos.id", "=", "tarefas.dep_destino")
      .where((query) => {
        if (empDestino !== null) {
          query.andWhere("empDestino", empDestino);
        }

        if (usuDestino !== null) {
          query.andWhere("usuDestino", usuDestino);
        }

        if (dataInicial !== null && dataFinal !== null) {
          query.andWhereBetween("dataConclusao", [
            dataInicial + " 00:00:00",
            dataFinal + " 23:59:59",
          ]);
        }

        if (depDestino !== null) {
          query.andWhere("depDestino", depDestino)
        }
      })
      .andWhere("tarefas.status_tarefa", "Completo")
      .select("tarefas.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .orderBy("data_conclusao")
      .paginate(page, limit);

    //Verifica antes se tem dados soma o total
    var totalTarefas = 0;
    var nomePessoa = 'Todos';
    var nomeEmpresa = 'Todas';

    if (typeof tarefas != 'undefined') {
        for (const chave in Object.values(tarefas)) {
          if (tarefas.hasOwnProperty(chave)){
             totalTarefas = totalTarefas + tarefas[chave].valor;
          } 
        }
    };
    
    if (typeof consPessoas != 'undefined' && consPessoas.length == 1 ) {
     var nomePessoa = consPessoas[0].name;
    }

    if (typeof consEmpresas != 'undefined' && consEmpresas.length == 1 ) {
       nomeEmpresa = consEmpresas[0].razaoSocial;
    }

    tarefas.baseUrl("lista");
    

    return view.render("listatarefa", {
      tarefas,
      pessoas,
      empresas,
      departamentos,
      totalTarefas,
      nomePessoa,
      nomeEmpresa,
    });
  }


}