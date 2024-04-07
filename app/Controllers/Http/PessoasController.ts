import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Pessoa from "App/Models/Usuario";

export default class PessoasController {
  public async index({ request, view }: HttpContextContract) {
    const objPessoa = {
      id: 0,
      name: "",
      email: "",
      telefone: "62 ",
      modulo: 4,
      cargo: 3,
      ativo: 1,
      desligado: 0,
      password: "",
    };

    const page = request.input("page", 1);
    const limit = 10;
    const pessoas = await Pessoa.query()
      .orderBy("desligado", "asc")
      .orderBy("ativo", "desc")
      .orderBy("name", "asc")
      .paginate(page, limit);

    pessoas.baseUrl("/pessoas");

    return view.render("pessoas", { objPessoa, pessoas });
  }

  public async edit({ view, params, request }: HttpContextContract) {
    const objPessoa = await Pessoa.findOrFail(params.id);

    const page = request.input("page", 1);
    const limit = 10;
    const pessoas = await Pessoa.query()
      .orderBy("name", "asc")
      .paginate(page, limit);

    pessoas.baseUrl("/pessoas");

    objPessoa.telefone === null ? (objPessoa.telefone = "") : null;
    objPessoa.password = "";

    return view.render("pessoas", { objPessoa, pessoas });
  }

  public async create({ request, response, session }: HttpContextContract) {
    try {
      if (request.input("id") === "0") {
        const validationSchema = schema.create({
          name: schema.string(),
          email: schema.string({ trim: true }, [
            rules.email(),
            rules.maxLength(180),
            rules.unique({ table: "pessoas", column: "email" }),
          ]),
          telefone: schema.string(),
          modulo: schema.string(),
          cargo: schema.string(),
          password: schema.string({ trim: true }, [rules.confirmed()]),
        });

        const validateData = await request.validate({
          schema: validationSchema,
          messages: {
            "name.required": "Informe o nome",
            "email.required": "Informe o email",
            "telefone.required": "Informe o telefone",
            "cargo.required": "Informe o cargo",
            "password.required": "Informe a senha",
          },
        });

        console.log("Validate Pessoa", validateData);


        await Pessoa.create({
          name: validateData.name,
          email: validateData.email,
          telefone: validateData.telefone,
          cargo: Number(validateData.cargo),
          ativo: !!request.input("ativo"),
          password: validateData.password,
          desligado: (request.input("desligado") === null ? 0 : request.input("desligado")),

        });
        session.flash("notification", "Pessoa adicionado com sucesso!");

      } else {
        const pessoa = await Pessoa.findOrFail(request.input("id"));

        if (!(!!request.input("desligado"))){
          console.log("Ativa")
          pessoa.name = request.input("name");
          pessoa.email = request.input("email");
          pessoa.telefone = request.input("telefone");
          pessoa.modulo = Number(request.input("modulo"));
          pessoa.cargo = request.input("cargo");
          pessoa.ativo = !!request.input("ativo");
          pessoa.password = request.input("password");
          pessoa.desligado = !!request.input("desligado");
        } else {
          pessoa.name = request.input("name");
          pessoa.email = request.input("email");
          pessoa.telefone = request.input("telefone");
          pessoa.modulo = Number(request.input("modulo"));
          pessoa.cargo = request.input("cargo");
          pessoa.ativo = false;
          pessoa.password = "999999";
          pessoa.desligado = !!request.input("desligado");
        }

        await pessoa.save();
        session.flash("notification", "Pessoa alterado com sucesso!");
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
    const pessoa = await Pessoa.findOrFail(params.id);

    pessoa.ativo = false;
    pessoa.password = "999999";
    pessoa.desligado =  true;

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
    const pessoa = await Pessoa.findOrFail(params.id);
    pessoa.ativo = !!request.input("activated");
    pessoa.cargo = request.input("cargo");
    pessoa.modulo = 4;
    await pessoa.save();

    session.flash(
      "notificationActivate",
      `${pessoa.name}, agora tem acesso ao Sistema.`
    );

    return response.redirect("back");
  }
}
