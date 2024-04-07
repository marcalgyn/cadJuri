import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Departamento from "App/Models/Departamento";

export default class DepartamentosController {
  public async index({ request, view }: HttpContextContract) {
    const objDepartamento = {
      id: 0,
      nome: "" };

    const page = request.input("page, 1");
    const limit = 10;

    const departamentos = await Departamento.query()
    .orderBy("nome", "asc")
    .paginate(page, limit);

    departamentos.baseUrl("/departamentos");

    return view.render("departamentos", { objDepartamento, departamentos });
  }

  public async edit({ view, params, request }: HttpContextContract) {
    const objDepartamento = await Departamento.findOrFail(params.id);

    const page = request.input("page", 1);
    const limit = 10;

    const departamentos = await Departamento.query()
    .orderBy("nome", "asc")
    .paginate(page, limit);

    departamentos.baseUrl("/departamentos");

    return view.render("departamentos", { objDepartamento, departamentos });
  }

  public async create({ request, response, session }: HttpContextContract) {
    /*
    const validationSchema = schema.create({
      nome: schema.string({ trim: true }, [rules.maxLength(255)]),
    });

    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "nome.required": "Informe o Nome do Departamento",

      },
    });
*/
    try {
      if (request.input("id") === "0") {
        const validationSchema = schema.create({
          nome: schema.string({ trim: true }, [rules.maxLength(255),
          rules.unique({table:"departamentos", column: "nome"}),
        ]),
        });

        const validateData = await request.validate({
          schema: validationSchema,
          messages: {
            "nome.required": "Informe o Nome do Departamento",

          },
        });

        await Departamento.create({
          nome: validateData.nome,

        });
        session.flash("notification", "Departamento adicionado com sucesso!");
      } else {
        const departamento = await Departamento.findOrFail(request.input("id"));
        departamento.nome = request.input("nome");
        await departamento.save();
        session.flash("notification", "Departamento alterado com sucesso!");
      }
    } catch (error) {
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }

    return response.redirect("back");
  }

  public async delete({ response, session, params }: HttpContextContract) {
    const departamento = await Departamento.findOrFail(params.id);

    await departamento.delete();

    session.flash("notification", "Departamento excluído com sucesso!");

    return response.redirect("back");
  }
}
