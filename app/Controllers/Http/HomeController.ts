import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Empresa from "App/Models/Empresa";
import Pessoa from "App/Models/Usuario";


export default class HomeController {
  public async index({ view, auth }: HttpContextContract) {

    
    let idEmpresaLogada : any = 0;
    let nivel : any = 9;
    

    if (auth.user){
      idEmpresaLogada = auth.user.empresa_id;
      nivel = auth.user.nivel;
    }

    const addPessoas = await Pessoa.query()
      .where('nivel', '=', '')  
     .orderBy("nome");

    console.log('id empresa.:', idEmpresaLogada);

    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', idEmpresaLogada);

    //HomeController.baseUrl("/home");
   
    return view.render("home/index", {
      empresas,
      addPessoas,
      nivel,
      auth,
      
    });
  }

  
  public async welcome({ view }: HttpContextContract) {
    return view.render("welcome");
  }
}
