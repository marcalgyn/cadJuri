import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Usuario from "App/Models/Usuario";

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
      nome: schema.string({ trim: true }),
      empresa_id: schema.number(),
      email: schema.string({ trim: true },[
        rules.email(),
        rules.maxLength(180),
        rules.unique({ table: "usuarios", column: "email" }),
      ]),
      password: schema.string({ trim: true }, [rules.confirmed()]),
      
    });''
    
    
    const validateData = await request.validate({
      schema: validationSchema,
    });

    console.log('Registrou ', validateData);

    const objPessoa = await Usuario.create(validateData);

    return view.render("welcome", { objPessoa });
  }

  public async login({
    request,
    auth,
    session,
    response,
  }: HttpContextContract) {

    const { email,  password} = request.all();

    //console.log(request.all());
    
      

    try {
      
      await auth.attempt(email, password);
      const isAtivo: boolean = auth.user?.$original.ativo;
      console.log('Ativo: ');
     
      
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
        "Não foi possível verificar suas credenciais: " + error
      );
      return response.redirect("back");
      

    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout();

    return response.redirect("/login");
  }

  
}
