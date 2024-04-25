import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules } from '@ioc:Adonis/Core/Validator';
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Tribunais from "App/Models/Tribunal";




export default class TribunalController {
  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id

    const objTribunal = {
      id: 0,
      nome: "",
      comarca: "",
      endereco: "",
      telefone: "",
      email: "",
      obs: "",
      vara: "",
      empresa_id: Number(idEmpresa),
    };

    const tribunais = await Tribunais.query()
    .where('empresa_id', '=', Number(idEmpresa))
    .orderBy("nome", "asc");

    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(auth.user?.empresa_id));

    
    return view.render("tribunal", { objTribunal, tribunais, idEmpresa, empresas });
  }

  public async edit({ view, params }: HttpContextContract) {
    
    const objTribunal = await Tribunais.findOrFail(params.id);
      
    return view.render("tribunal", { objTribunal });
  }

  public async create({ request, response, session, auth }: HttpContextContract) {

    try {
      const validationSchema = schema.create({
        nome: schema.string({trim: true}, [rules.maxLength(255)]),

      });

      const validateData = await request.validate({ schema: validationSchema,
        messages: {
          "nome.required": "Informe o Tribunal",
        }, });

      console.log(validateData);

      if (request.input("id") === "0") {
        await Tribunais.create({
          nome: validateData.nome === null ? '' : validateData.nome.toUpperCase(),
          comarca: request.input('comarca') === null ? '' : request.input('comarca').toUpperCase(),
          endereco: request.input('endereco') === null ? '' : request.input('endereco').toUpperCase(),
          telefone: request.input('telefone') === null ? '' : request.input('telefone').toUpperCase(),
          email: request.input('email') === null ? '' : request.input('email').toLowerCase(),
          vara: request.input('vara') === null ? '' : request.input('vara').toUpperCase(),
          obs : request.input('observacao') === null ? '' : request.input('observacao').toUpperCase(),
          empresa_id: auth.user?.empresa_id,
        });

        session.flash("notification", "Tribunal adicionado com sucesso!");
      
      } else {

        const tribunal = await Tribunais.findOrFail(request.input("id"));

        tribunal.nome = request.input("nome") === null ? '' : request.input("nome").toUpperCase();
        tribunal.comarca = request.input('comarca') === null ? '' : request.input('comarca').toUpperCase();
        tribunal.endereco = request.input('endereco') === null ? '' : request.input('endereco').toUpperCase();
        tribunal.telefone = request.input('telefone');
        tribunal.email = request.input('email') ===null ? '' : request.input('email').toLowerCase;
        tribunal.vara = request.input('vara') === null ? '' : request.input('vara').toUpperCase();
        tribunal.obs = request.input('observacao') === null ? '' : request.input('observacao').toUpperCase();
        

        await tribunal.save();

        session.flash("notification", "Tribunal alterada com sucesso!");
      }

    } catch (error) {
      console.log("Error:", error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }
    return response.redirect('/tribunais');

    //return response.redirect("back");
  }

  /*** EDITAR A PARTIR  
  public async lista({ request, view }: HttpContextContract) {

    const empresas = await Empresa.all();
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

  */

  


}