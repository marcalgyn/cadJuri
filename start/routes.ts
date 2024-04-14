import Route from "@ioc:Adonis/Core/Route";

Route.get("/", "HomeController.index").middleware("auth");
Route.get("/home", "HomeController.index").middleware("auth");
Route.post("/home/filter", "HomeController.filter").middleware("auth");
Route.post("/home/filterOS", "HomeController.filterOS").middleware("auth");
Route.get("/welcome", "HomeController.welcome").middleware("guest");

Route.group(() => {
  Route.get("/", "EmpresasController.index");
  Route.get("/:id", "EmpresasController.edit");
  Route.post("/", "EmpresasController.create");
  Route.post("/:id", "EmpresasController.create");
  Route.delete("/:id", "EmpresasController.delete");
})
  .prefix("/empresas")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "PessoasController.index");
  Route.get("/:id", "PessoasController.edit");
  Route.post("/", "PessoasController.create");
  Route.patch("/:id", "PessoasController.activate");
  Route.delete("/:id", "PessoasController.delete");
  Route.get("/add", "PessoasController.add");
})
  .prefix("/pessoas")
  .middleware("auth");

  Route.group(() => {
    Route.get("/", "ClientesController.index");
    Route.get("/:id", "ClientesController.edit");
    Route.post("/", "ClientesController.create");
  })
    .prefix("/clientes")
    .middleware("auth");


  
Route.group(() => {
  Route.get("/", "JuizadosController.index");
  Route.post("/filtro", "JuizadosController.filtro");
  Route.get("/lista", "JuizadosController.lista");
  Route.get("/:id", "JuizadosController.edit");
  Route.post("/", "JuizadosController.create");
  Route.patch("/:id", "JuizadosController.finalize");
  Route.post("/:id", "JuizadosController.cancela");
  
})
  .prefix("/juizados")
  .middleware("auth");

  Route.group(() =>{
    Route.get("/", "EstatusController.index");
    Route.get("/:id", "EstatusController.edit");
    Route.post("/", "EstatusController.create");
    Route.patch("/:id", "EstatusController.finalize");
    Route.delete("/:id", "EstatusController.delete");
  })
  .prefix("/estatus")
  .middleware("auth");

/*

Route.group(() => {
  Route.get("/", "OrdemServicoController.index");
  Route.post("/filtro", "OrdemServicoController.filtro");
  Route.get("/lista", "OrdemServicoController.lista");
  Route.get("/:id", "OrdemServicoController.edit");
  Route.post("/", "OrdemServicoController.create");
  Route.patch("/:id", "OrdemServicoController.finalize");
  Route.post("/:id", "OrdemServicoController.cancela");
  Route.post("/listaOrcamento", "OrdemServicoController.filtro");
})
  .prefix("/ordensServicos")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "DepartamentosController.index");
  Route.get("/:id", "DepartamentosController.edit");
  Route.post("/", "DepartamentosController.create");
  Route.patch("/:id", "DepartamentosController.finalize");
  Route.delete("/:id", "DepartamentosController.delete");
})
  .prefix("/departamentos")
  .middleware("auth");




Route.group(() => {
  Route.get("/", "PatrimoniosController.index");
  Route.post("/filtro", "PatrimoniosController.filtro");
  Route.get("/lista", "PatrimoniosController.lista");
  Route.get("/:id", "PatrimoniosController.edit");
  Route.post("/", "PatrimoniosController.create");
  Route.patch("/:id", "PatrimoniosController.finalize");
  Route.delete("/:id", "PatrimoniosController.delete");
})
  .prefix("/patrimonios")
  .middleware("auth");
*/



  /*
Route.group(() => {
  Route.get("/", "ClienteSacadoresController.index");
  Route.get("/:id", "ClienteSacadoresController.edit");
  Route.post("/", "ClienteSacadoresController.create");
})
  .prefix("/sacadores")
  .middleware("auth");


Route.group(() => {
  Route.get("/lista", "TitulosController.lista");
  Route.post("/filtro", "TitulosController.filtro");
  Route.get("/", "TitulosController.index");
  Route.get("/:id", "TitulosController.edit");
  Route.get("/:id/load-rates", "TitulosController.loadRates");
  Route.post("/", "TitulosController.create");
  Route.patch("/:id/baixar", "TitulosController.baixarTitulo");
  Route.patch("/:id/estornar", "TitulosController.estornarTitulo");
  Route.delete("/:id", "TitulosController.delete");
})
  .prefix("/titulos")
  .middleware("auth");

  */
Route.group(() => {
  Route.get("/", "DashboardController.index");
})
  .prefix("/dashboard")
  .middleware("auth");

Route.get("/register", "AuthController.showRegister").middleware("guest");
Route.post("/register", "AuthController.register");
Route.post("/logout", "AuthController.logout");
Route.get("/login", "AuthController.showLogin").middleware("guest");
Route.post("/login", "AuthController.login");
