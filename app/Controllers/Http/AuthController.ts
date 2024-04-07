import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Pessoa from "App/Models/Usuario";

export default class AuthController {
  public async showLogin({ view }: HttpContextContract) {
    return view.render("auth/login");
  }

  public showRegister({ view }: HttpContextContract) {
    return view.render("auth/register");
  }

  public async register({ request, view }: HttpContextContract) {
    const validationSchema = schema.create({
      ativo: schema.boolean(),
      name: schema.string({ trim: true }),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.maxLength(180),
        rules.unique({ table: "pessoas", column: "email" }),
      ]),
      password: schema.string({ trim: true }, [rules.confirmed()]),
    });

    const validateData = await request.validate({
      schema: validationSchema,
    });

    const objPessoa = await Pessoa.create(validateData);

    return view.render("welcome", { objPessoa });
  }

  public async login({
    request,
    auth,
    session,
    response,
  }: HttpContextContract) {
    const { email, password } = request.all();

    try {
      await auth.attempt(email, password);
      const isAtivo: boolean = auth.user?.$original.ativo;
      const isDesligado: boolean = auth.user?.$original.desligado;
     // const isEmpresa: number = auth.user?.$original.empresa_id

      if (isDesligado) {
        await auth.logout();
        session.flash(
          "notification",
          "O seu acesso ao sistema foi bloqueado, favor falar com a administração."
        );
        return response.redirect("back");
      }

      if (isAtivo) {
        console.log("Acesso liberado");
        return response.redirect("/home");
      } else {
        await auth.logout();
        session.flash(
          "notification",
          "O seu cadastro não está ativo, favor aguarde!"
        );
        return response.redirect("back");
      }
    } catch (error) {
      session.flash(
        "notification",
        "Não foi possível verificar suas credenciais"
      );
      return response.redirect("back");
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout();

    return response.redirect("/login");
  }
}
