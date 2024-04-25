import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Usuario from "App/Models/Usuario";
import Empresa from "App/Models/Empresa";

export default class PessoasController {
  public async index({ request, view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id;

    const objUsuario = {
      id: 0,
      nome: "",
      email: "",
      telefone: "",
      login:"",
      password: "",
      password_confirmation: "",
      ativo: 1,
      nivel: 0,
    };

    const page = request.input("page", 1);
    const limit = 10;
    const usuarios = await Usuario.query()
    .where('empresa_id', '=', Number(idEmpresa))
      .orderBy("ativo", "asc")
      .orderBy("nivel", "desc")
      .orderBy("nome", "asc")
      .paginate(page, limit);
    
      const empresas = await Empresa.query()
      .select('empresas.fantasia')
      .select('empresas.logo')
      .where('empresas.id', '=', Number(auth.user?.empresa_id));

    usuarios.baseUrl("/pessoas");

    return view.render("pessoas", { objUsuario, usuarios, idEmpresa, empresas });
  }

  public async edit({ view, params, request, auth }: HttpContextContract) {
    const objUsuario = await Usuario.findOrFail(params.id);

    const page = request.input("page", 1);
    const limit = 10;
    const usuarios = await Usuario.query()
      .orderBy("nome", "asc")
      .paginate(page, limit);

    usuarios.baseUrl("/pessoas");

    objUsuario.telefone === null ? (objUsuario.telefone = "") : null;
    objUsuario.password = String(auth.user?.password);


    return view.render("pessoas", { objUsuario, usuarios });
  }

  public async create({ request, response, session, auth }: HttpContextContract) {
    try {
      if (request.input("id") === "0") {
        const validationSchema = schema.create({
          nome: schema.string(),
          email: schema.string({ trim: true }, [
            rules.email(),
            rules.maxLength(180),
            rules.unique({ table: "usuarios", column: "email" }),
          ]),
          telefone: schema.string(),
          password: schema.string({ trim: true }, [rules.confirmed()]),
        });

        const validateData = await request.validate({
          schema: validationSchema,
          messages: {
            "nome.required": "Informe o nome",
            "email.required": "Informe o email",
            "password.required": "Informe a senha",
          },
        });

        console.log("Validação de dados do Usuario", validateData);


        await Usuario.create({
          nome: validateData.nome === null ? '' : validateData.nome.toUpperCase(),
          email: validateData.email === null ? '' : validateData.email.toLowerCase(),
          telefone: validateData.telefone,
          password: validateData.password,
          ativo: (request.input("ativo") === null ? true : true),
          empresa_id: auth.user?.empresa_id,
        });
        session.flash("notification", "Usuário adicionado com sucesso!");

      } else {
        const usuario = await Usuario.findOrFail(request.input("id"));

        if (!(!!request.input("inativo"))){
          usuario.nome = request.input("nome") === null ? '' : request.input("nome").toUpperCase();
          usuario.email = request.input("email") === null ? '' : request.input("email").toLowerCase();
          usuario.telefone = request.input("telefone");
          usuario.password = request.input("password");
          usuario.ativo = !!request.input("ativo");
          usuario.nivel = request.input("nivel");
          usuario.empresa_id = Number(auth.user?.empresa_id);

        } else {
          usuario.nome = request.input("nome") === null ? '' : request.input("nome").toUpperCase();
          usuario.email = request.input("email") === null ? '' : request.input("email").toLowerCase();
          usuario.telefone = request.input("telefone");
          usuario.password = "999999";
          usuario.ativo = false;
          usuario.nivel = request.input("nivel");
          usuario.empresa_id = Number(auth.user?.empresa_id);
        }

        await usuario.save();
        session.flash("notification", "Usuario alterado com sucesso!");
      }
    } catch (error) {
      console.log("Erro Pessoa", error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }
    return response.redirect("back");
  }

  public async delete({ response, session, params }: HttpContextContract) {
    const pessoa = await Usuario.findOrFail(params.id);

    pessoa.ativo = false;
    pessoa.password = "999999";
    
    await pessoa.save();

   // await pessoa.delete();

    session.flash("notification", "Pessoa excluída com sucesso!");

    return response.redirect("back");
  }

  public async activate({
    request,
    response,
    session,
    params,
  }: HttpContextContract) {
    const usuario = await Usuario.findOrFail(params.id);
    usuario.ativo = !!request.input("true");
    await usuario.save();

    session.flash(
      "notificationActivate",
      `${usuario.nome}, agora tem acesso ao Sistema.`
    );

    return response.redirect("back");
  }
}
