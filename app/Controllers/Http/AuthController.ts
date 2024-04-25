import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Usuario from "App/Models/Usuario";
import Empresas from "App/Models/Empresa";

export default class AuthController {
  public async showLogin({ view }: HttpContextContract) {
    return view.render("auth/login");
  }

  public showRegister({ view }: HttpContextContract) {
    return view.render("auth/register");
  }

  public async register({ request, session, response, view }: HttpContextContract) {
    
    const empresa = await Empresas.query()
    .select('empresas.id')
    .where('empresas.cpfcnpj', '=', request.input('cpfcnpj'));

    console.log('empresa ', empresa)

      if (empresa.length > 0 ) {
        session.flash(
          "notification",
          "A empresa já esta cadastrado em nosso sistema. Solicite ao administrador para ativalo!"
        );
        return response.redirect("back");
      } else {
            await Empresas.create({
              cpfcnpj: request.input('cpfcnpj'),
              razaosocial: request.input('razaosocial'),
              fantasia: request.input('razaosocial'),
              logo: '',
            });
            const empresa = await Empresas.query()
            .select('empresas.id')
            .where('empresas.cpfcnpj', '=', request.input('cpfcnpj'))
            
            const emp = empresa[0].$attributes['id'];
            console.log('Empresa Nova ', emp);

        try {

          const validationSchema = schema.create({
            ativo: schema.boolean(),
            nome: schema.string({ trim: true }),
            nivel: schema.string({trim: true}),
            email: schema.string({ trim: true },[
            rules.email(),
            rules.maxLength(180),
            rules.unique({ table: "usuarios", column: "email" }),
          ]),
          password: schema.string({ trim: true }, [rules.confirmed()]),
          
        });
      
        const validateData = await request.validate({
          schema: validationSchema,
        });
        
          await Usuario.create({
            nome: validateData.nome,
            email: validateData.email.toLowerCase(),
            ativo: validateData.ativo,
            nivel: validateData.nivel,
            password: validateData.password,
            empresa_id: emp,
          });
          
          console.log('Registrou Usuario: ', validateData);
          return view.render("welcome", {});

        } catch (error) {
            await Empresas.query()
            .delete('empresas')
            .where('empresas.id', '=', emp);

          console.log('Erro ao Inserir Usuário', error);
          let msg: string = "";
          if (error.code === "ER_DUP_ENTRY" || error.code === "unique validation failure" || error.code === "E_VALIDATION_FAILURE")  {
            msg = `Este e-mail já existe no sistema, operação será cancelada!!`;
          }

          session.flash("notification", msg);
          
        }
        return response.redirect("back");

        /*const objPessoa = await Usuario.create(
          validateData
          );
        */

 
  }
  }

  public async login({
    request,
    auth,
    session,
    response,
  }: HttpContextContract) {

    const { email,  password} = request.all();
    console.log(request.all());

    try {
      
      await auth.attempt(email, password);
      const isAtivo: boolean = auth.user?.$original.ativo;
      
      if (isAtivo) {
        
        console.log("Acessou o sistema CadJuri...");

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
        "Usuario ou senha inválido! "
      );
      return response.redirect("back");

    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout();

    return response.redirect("/login");
  }

  
}
