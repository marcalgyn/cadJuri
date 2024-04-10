import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Juizados from "App/Models/Juizado";
import Pessoa from "App/Models/Usuario";
import { DateTime } from "luxon";
import moment from "moment";


export default class TarefaController {
  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id

    const objJuizado = {
      id: 0,
      nomeJuizado: '',
      comarca: '',
      endereco: '',
      telefone: '',
      email: '',
      observacao: '',
    };

    const juizados = await Juizados.query()
    .where('empresa_id', '=', Number(idEmpresa))
    .orderBy("nomejuizado", "asc");

    return view.render("juizado", { objJuizado, juizados, idEmpresa });
  }

  public async edit({ view, params }: HttpContextContract) {
    const empresas = await Empresa.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const objTarefa = await Tarefa.findOrFail(params.id);

    return view.render("tarefa", { objTarefa, empresas, pessoas, departamentos });
  }

  public async finalize({ response, session, params }: HttpContextContract) {
    const tarefa = await Tarefa.findOrFail(params.id);

    tarefa.statusTarefa = "Completo";
    tarefa.dataConclusao = DateTime.now();

    await tarefa.save();

    session.flash("notification", "Tarefa finalizada com sucesso!!");

    return response.redirect("back");
  }

  public async create({ request, response, session }: HttpContextContract) {

    try {
      const validationSchema = schema.create({
        prioridade: schema.number(),
        empOrigem: schema.number(),
        empDestino: schema.number(),
        usuOrigem: schema.number(),
        usuDestino: schema.number(),
        depDestino: schema.number(),
        descricao: schema.string({ trim: true }),
        dataOrigem: schema.date(),
        dataPrevisao: schema.date(),
        statusTarefa: schema.string({ trim: true }),

      });

      const validateData = await request.validate({ schema: validationSchema });

      let imagemAbertura: string = "";
      let imagemConclusao: string = "";
      const fileAbertura = request.file("imagemAbertura");
      if (fileAbertura) {
        const nomeImagem = this.normalizaNomeImagem(fileAbertura.clientName);
        imagemAbertura = `/assets/img_tarefas/${nomeImagem}`;
        await fileAbertura.move("public/assets/img_tarefas", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      const fileConclusao = request.file("imagemConclusao");
      if (fileConclusao) {
        const nomeImagem = this.normalizaNomeImagem(fileConclusao.clientName);
        imagemConclusao = `/assets/img_tarefas/${nomeImagem}`;
        await fileConclusao.move("public/assets/img_tarefas", {
          name: nomeImagem,
          overwrite: true,
        });
      }
      let dataAtual: DateTime | null | undefined;


      if (request.input("statusTarefa") === "Completo" && request.input("dataConclusao") === null) {
        dataAtual = DateTime.now();
      } else {
        dataAtual = null
      }

      if (request.input("id") === "0") {
        this.convertStrToDateTime(
          request.input("dataOrigem"),
          request.input("horaOrigem")
        );

        await Tarefa.create({
          prioridade: validateData.prioridade,
          empOrigem: validateData.empOrigem,
          empDestino: validateData.empDestino,
          usuOrigem: validateData.usuOrigem,
          usuDestino: validateData.usuDestino,
          depDestino: validateData.depDestino,
          descricao: validateData.descricao,
          valor: request.input("valor").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),

          dataOrigem: this.convertStrToDateTime(
            request.input("dataOrigem"),
            request.input("horaOrigem")
          ),
          dataPrevisao: this.convertStrToDateTime(
            request.input("dataPrevisao"),
            request.input("horaPrevisao")
          ),
          statusTarefa: validateData.statusTarefa,
          urlOrigem: imagemAbertura,
          urlFinal: imagemConclusao,

          dataConclusao:
            request.input("dataConclusao") !== null
              ? this.convertStrToDateTime(
                request.input("dataConclusao"),
                request.input("horaConclusao")
              )
              : dataAtual,
        });

        session.flash("notification", "Tarefa adicionada com sucesso!");

        const objEmpresa = await Empresa.findOrFail(validateData.empDestino);
        let empresa = objEmpresa.razaoSocial;

        const objPessoa = await Pessoa.findOrFail(validateData.usuDestino);
        let usuarioDestino = objPessoa.name;
        let emailUsuario = objPessoa.email;

        const objPessoaDest = await Pessoa.findOrFail(validateData.usuOrigem);
        let usuarioOrigem = objPessoaDest.name;


        var defaultClient = SibApiV3Sdk.ApiClient.instance;
        var apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY; //Chave API e-mail

        var smskey = defaultClient.authentications['api-key'];
        smskey.apiKey = process.env.SMS_KEY; //Chave API SMS



    

 




      } else {
        const tarefa = await Tarefa.findOrFail(request.input("id"));
        tarefa.prioridade = request.input("prioridade");
        tarefa.empOrigem = request.input("empOrigem");
        tarefa.usuOrigem = request.input("usuOrigem");
        tarefa.empDestino = request.input("empDestino");
        tarefa.usuDestino = request.input("usuDestino");
        tarefa.depDestino = request.input("depDestino");
        tarefa.descricao = request.input("descricao");
        tarefa.valor = request.input("valor").toLocaleString('pt-BR', { maximumSignificantDigits: 2 });
        tarefa.dataOrigem = this.convertStrToDateTime(
          request.input("dataOrigem"),
          request.input("horaOrigem")
        );
        tarefa.dataPrevisao = this.convertStrToDateTime(
          request.input("dataPrevisao"),
          request.input("horaPrevisao")
        );
        tarefa.dataConclusao =
          request.input("dataConclusao") !== null
            ? this.convertStrToDateTime(
              request.input("dataConclusao"),
              request.input("horaConclusao")
            )
            : null;
        tarefa.statusTarefa = request.input("statusTarefa");
        if (imagemAbertura !== "") {
          tarefa.urlOrigem = imagemAbertura;
        }
        if (imagemConclusao !== "") {
          tarefa.urlFinal = imagemConclusao;
        }


        if (request.input("statusTarefa") == "Completo" && request.input("dataConclusao") == "") {
          tarefa.dataConclusao = DateTime.now();
        }

        await tarefa.save();

        session.flash("notification", "Tarefa alterada com sucesso!");
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

  public async cancela({ response, session, params }: HttpContextContract) {
    const tarefa = await Tarefa.findOrFail(params.id);

    tarefa.statusTarefa = "Cancelado";
    tarefa.dataConclusao = DateTime.now();
    await tarefa.save();

    // await tarefa.delete();

    session.flash("notification", "Tarefa Cancelada com sucesso!");

    return response.redirect("back");

  }

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


  /** Retorna um DateTime Luxon  **/
  public convertStrToDateTime(dataInput: string, horaInput: string): any {
    const dataLuxon = DateTime.fromISO(
      dataInput.concat("T").concat(horaInput).concat(":00.000")
    );

    return dataLuxon;
  }

  public normalizaNomeImagem(value: String): string {
    return (
      moment().format("DDMMYYYYHHmmss") +
      "_" +
      value.normalize("NFD").split(" ").join("")
    );
  }
 

}