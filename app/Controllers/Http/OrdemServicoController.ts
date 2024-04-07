import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Pessoa from "App/Models/Usuario";
import Departamento from "App/Models/Departamento";
import OrdemServico from "App/Models/OrdemServico";
import { DateTime } from "luxon";
import moment from "moment";
import SibApiV3Sdk  from "sib-api-v3-sdk";
import { Request } from "@adonisjs/core/build/standalone";


export default class OrdemServicoController {

  public async index({ view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const objOrdemServico = {
      id: 0,
      empOrigem: 0,
      usuOrigem: 0,
      empDestino: 0,
      usuDestino: 0,
      dataOrigem: DateTime.now(),
      dataRealizado: null,
      dataConclusao: null,
      descricao: "",
      prioridade: 2,
      statusOrdemServico: "Analise",
      statusProgresso: "",
      valor: "0,00",
      urlOrigem: "",
      urlFinal: "",
      urlOrigem2: "",
      urlFinal2: "",
      formaPagamento: "",
    };

    return view.render("ordemServico", {
      objOrdemServico,
      empresas,
      pessoas,
      departamentos,
    });
  }

  public async edit({ view, params }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const objOrdemServico = await OrdemServico.findOrFail(params.id);

    const pessoa = await Pessoa.findOrFail(objOrdemServico.usuOrigem);
    
    console.log('OSid', objOrdemServico.id);
    console.log('usuarioOrigem', objOrdemServico.usuOrigem);
    console.log('idPessoa', pessoa.id);
    console.log('idCargo', pessoa.cargo);
    console.log('Valor ', objOrdemServico.valor);

    let disabledField = (objOrdemServico.statusOrdemServico === 'Aprovado' && pessoa.cargo !== 1) ? 'disabled' : '';
    let disabledForm = ((objOrdemServico.statusOrdemServico === 'Reprovado' || objOrdemServico.statusOrdemServico === 'Concluido') && pessoa.cargo !== 1) ? 'disabled' : '';

    return view.render("ordemServico", {
      objOrdemServico,
      empresas,
      pessoas,
      departamentos,
      disabledField,
      disabledForm,
      pessoa
    });
  }

  public async finalize({ view, params }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const objOrdemServico = await OrdemServico.findOrFail(params.id);

    objOrdemServico.statusOrdemServico = "Concluido";
    objOrdemServico.dataConclusao = DateTime.now();

    return view.render("ordemServico", {
      objOrdemServico,
      empresas,
      pessoas,
      departamentos,
    });
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
        statusOrdemServico: schema.string({ trim: true }),
      });

      const validateData = await request.validate({ schema: validationSchema });

      let imagemAbertura: string = "";
      let imagemConclusao: string = "";
      let imagem2Abertura: string = "";
      let imagem2Conclusao: string = "";

      const fileAbertura = request.file("imagemAbertura");
      if (fileAbertura) {
        const nomeImagem = this.normalizaNomeImagem(fileAbertura.clientName);
        imagemAbertura = `/assets/img_ordemServicos/${nomeImagem}`;
        await fileAbertura.move("public/assets/img_ordemServicos", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      const fileConclusao = request.file("imagemConclusao");
      if (fileConclusao) {
        const nomeImagem = this.normalizaNomeImagem(fileConclusao.clientName);
        imagemConclusao = `/assets/img_ordemServicos/${nomeImagem}`;
        await fileConclusao.move("public/assets/img_ordemServicos", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      const file2Abertura = request.file("imagem2Abertura");
      if (file2Abertura) {
        const nomeImagem = this.normalizaNomeImagem(file2Abertura.clientName);
        imagem2Abertura = `/assets/img_ordemServicos/${nomeImagem}`;
        await file2Abertura.move("public/assets/img_ordemServicos", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      const file2Conclusao = request.file("imagem2Conclusao");
      if (file2Conclusao) {
        const nomeImagem = this.normalizaNomeImagem(file2Conclusao.clientName);
        imagem2Conclusao = `/assets/img_ordemServicos/${nomeImagem}`;
        await file2Conclusao.move("public/assets/img_ordemServicos", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      if (request.input("id") === "0") {

        await OrdemServico.create({
          prioridade: validateData.prioridade,
          empOrigem: validateData.empOrigem,
          empDestino: validateData.empDestino,
          usuOrigem: validateData.usuOrigem,
          usuDestino: validateData.usuDestino,
          depDestino: validateData.depDestino,
          descricao: validateData.descricao,


          formaPagamento: request.input("formaPagamento"),
          valor: request
            .input("valor"),

          dataOrigem: this.convertStrToDateTime(request.input("dataOrigem")),
          dataRealizado:
            request.input("dataRealizado") !== undefined && request.input("dataRealizado") !== null
              ? this.convertStrToDateTime(request.input("dataRealizado"))
              : null,
          dataConclusao:
            request.input("dataConclusao") !== undefined && request.input("dataConclusao") !== null
              ? this.convertStrToDateTime(request.input("dataConclusao"))
              : null,
          statusOrdemServico: validateData.statusOrdemServico,
          statusProgresso: request.input("statusProgresso"),

          urlOrigem: imagemAbertura,
          urlFinal: imagemConclusao,

          urlOrigem2: imagem2Abertura,
          urlFinal2: imagem2Conclusao,

        });

        session.flash("notification", "Orçamento criado com sucesso!");

        const objEmpresa = await Empresa.findOrFail(validateData.empDestino);
        let empresa = objEmpresa.razaoSocial;

        const objPessoa = await Pessoa.findOrFail(validateData.usuDestino);
        let usuarioDestino = objPessoa.name;
        let emailUsuario = objPessoa.email;

        const objPessoaDest = await Pessoa.findOrFail(validateData.usuOrigem);
        let usuarioOrigem = objPessoaDest.name;

        let descOrcamento = validateData.descricao;


        var defaultClient = SibApiV3Sdk.ApiClient.instance;
        var apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY; //Chave API e-mail

        var smskey = defaultClient.authentications['api-key'];
        smskey.apiKey = process.env.SMS_KEY; //Chave API SMS


        /***  Criação de envio SMS ***/

/** Bloco de Codigo comentado para nao enviar neste momento sms **/

        let apiInstance = new SibApiV3Sdk.TransactionalSMSApi();
        let sendTransacSms = new SibApiV3Sdk.SendTransacSms();
        let telefone = objPessoa.telefone.replace("(","");
            telefone = telefone.replace(")", "");
            telefone = telefone.replace("-", "");
            telefone = telefone.replace(" ", "");

        sendTransacSms = {
          "sender":"Ordemix",
          "recipient":"55"+ telefone,
          "content":"Olá, " + (usuarioDestino).substring(0, 15) + " Voce possui um novo Orçamento no Sistema Ordemix. " +
          "Acesse agora https://ordemix.com.br!",
      };

      console.log(" SMS Enviado para " + (usuarioDestino).substring(0, 15));

      apiInstance.sendTransacSms(sendTransacSms).then(function(data) {
        console.log('SMS Enviado com sucesso: ' + JSON.stringify(data));
      }, function(error) {
        console.error(error);
      });


        /** criacao para envio de email **/

        new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
          {
            'subject':'Novo Orçamento ',
            'sender' : {'email':'naoresponda@ordemix.com.br', 'name':'Sistema Ordemix'},
            'to' : [{'name': usuarioDestino, 'email': emailUsuario}],
            'htmlContent' : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> '+
                            '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" '+
                            'xmlns:o="urn:schemas-microsoft-com:office:office">'+
                            '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta http-equiv="X-UA-Compatible" '+
                            'content="IE=edge"><meta name="format-detection" content="telephone=no">'+
                            '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
                            '<title>Nova Tarefa</title><style type="text/css" emogrify="no">#outlook a { padding:0; } '+
                            '.ExternalClass { width:100%; } .ExternalClass, .ExternalClass p, .ExternalClass span, '+
                            '.ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; } '+
                            'table td { border-collapse: collapse; mso-line-height-rule: exactly; } '+
                            '.editable.image { font-size: 0 !important; line-height: 0 !important; } '+
                            '.nl2go_preheader { display: none !important; mso-hide:all !important; '+
                            'mso-line-height-rule: exactly; visibility: hidden !important; line-height: 0px'+
                            ' !important; font-size: 0px !important; } body { width:100% !important; '+
                            '-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; }'+
                            ' img { outline:none; text-decoration:none; -ms-interpolation-mode: bicubic; } a '+
                            'img { border:none; } table { border-collapse:collapse; mso-table-lspace:0pt; '+
                            'mso-table-rspace:0pt; } th { font-weight: normal; text-align: left; } '+
                            '*[class="gmail-fix"] { display: none !important; } </style>'+
                            '<style type="text/css" emogrify="no"> @media (max-width: 600px) '+
                            '{ .gmx-killpill { content: ""\\03D1"";} } </style><style type="text/css" '+
                            'emogrify="no">@media (max-width: 600px) { .gmx-killpill { content: "" \\03D1"";}'+
                            ' .r0-c { box-sizing: border-box !important; text-align: center !important; '+
                            'valign: top !important; width: 320px !important } .r1-o '+
                            ' { border-style: solid !important; margin: 0 auto 0 auto !important; width: 320px !important }'+
                            ' .r2-c { box-sizing: border-box !important; text-align: center !important; '+
                            'valign: top !important; width: 100% !important } .r3-o '+
                            '{ border-style: solid !important; margin: 0 auto 0 auto !important;'+
                            ' width: 100% !important } .r4-i { background-color: #ffffff !important; '+
                            'padding-bottom: 20px !important; padding-left: 15px !important; '+
                            'padding-right: 15px !important; padding-top: 20px !important } '+
                            '.r5-c { box-sizing: border-box !important; display: block !important; '+
                            'valign: top !important; width: 100% !important } .r6-o '+
                            '{ border-style: solid !important; width: 100% !important }'+
                            '.r7-i { padding-left: 0px !important; padding-right: 0px !important } '+
                            '.r8-i { background-color: #ffffff !important; padding-bottom: 20px !important; '+
                            'padding-left: 10px !important; padding-right: 10px !important;'+
                            'padding-top: 20px !important } .r9-c { box-sizing: border-box !important;'+
                            'text-align: left !important; valign: top !important; width: 100% !important } '+
                            '.r10-o { border-style: solid !important; margin: 0 auto 0 0 !important; '+
                            'width: 100% !important } .r11-i { padding-top: 15px !important; '+
                            'text-align: center !important } .r12-i { padding-bottom: 15px !important; '+
                            'padding-top: 15px !important } .r13-i { padding-top: 15px !important;'+
                            'text-align: left !important } .r14-i { padding-bottom: 15px !important; '+
                            'padding-top: 15px !important; text-align: left !important } .r15-o '+
                            '{ border-style: solid !important; margin: 0 auto 0 auto !important; '+
                            'margin-bottom: 15px !important; margin-top: 15px !important; width: 100% !important }'+
                            '.r16-i { text-align: center !important } .r17-r { background-color: #00e9c5 !important; '+
                            'border-radius: 4px !important; border-width: 0px !important; box-sizing: border-box; '+
                            'height: initial !important; padding-bottom: 12px !important; padding-left: 5px !important;'+
                            'padding-right: 5px !important; padding-top: 12px !important; text-align: center !important; '+
                            'width: 100% !important } .r18-c { box-sizing: border-box !important; text-align: center !important;'+
                            'width: 100% !important } .r19-c { box-sizing: border-box !important; width: 100% !important } '+
                            '.r20-i { font-size: 0px !important; padding-bottom: 3px !important; padding-left: 105px !important;'+
                            'padding-right: 105px !important; padding-top: 3px !important } .r21-c { box-sizing: border-box !important;'+
                            'width: 32px !important } .r22-o { border-style: solid !important; margin-right: 8px !important; '+
                            'width: 32px !important } .r23-i { padding-bottom: 5px !important; padding-top: 5px !important } '+
                            '.r24-o { border-style: solid !important; margin-right: 0px !important; width: 32px !important } '+
                            '.r25-i { background-color: #eff2f7 !important; padding-bottom: 0px !important; padding-left: 15px '+
                            '!important; padding-right: 15px !important; padding-top: 0px !important } .r26-i { color: #3b3f44 '+
                            '!important; padding-bottom: 0px !important; padding-top: 15px !important; text-align: center !important }'+
                            '.r27-i { color: #3b3f44 !important; padding-bottom: 0px !important; padding-top: 0px !important; '+
                            'text-align: center !important } .r28-i { color: #3b3f44 !important; padding-bottom: 15px !important; '+
                            'padding-top: 15px !important; text-align: center !important } .r29-i { padding-bottom: 15px !important; '+
                            'padding-left: 0px !important; padding-right: 0px !important; padding-top: 0px !important } '+
                            '.r30-c { box-sizing: border-box !important; text-align: center !important; valign: top !important;'+
                            'width: 129px !important } .r31-o { border-style: solid !important; margin: 0 auto 0 auto !important; '+
                            'width: 129px !important } body { -webkit-text-size-adjust: none } .nl2go-responsive-hide { display: none }'+
                            '.nl2go-body-table { min-width: unset !important } .mobshow { height: auto !important; '+
                            'overflow: visible !important; max-height: unset !important; visibility: visible !important;'+
                            'border: none !important } .resp-table { display: inline-table !important } .magic-resp '+
                            '{ display: table-cell !important } } </style><!--[if !mso]><!--><style type="text/css" emogrify="no">'+
                            '</style><!--<![endif]--><style type="text/css">p, h1, h2, h3, h4, ol, ul { margin: 0; } a, '+
                            'a:link { color: #00e9c5; text-decoration: underline } .nl2go-default-textstyle '+
                            '{ color: #3b3f44; font-family: arial,helvetica,sans-serif; font-size: 16px; line-height: 1.5;'+
                            'word-break: break-word } .default-button { color: #000000; font-family: arial,helvetica,sans-serif;'+
                            'font-size: 16px; font-style: normal; font-weight: bold; line-height: 1.15; text-decoration: none; '+
                            'word-break: break-word } .default-heading1 { color: #1F2D3D; font-family: arial,helvetica,sans-serif;'+
                            'font-size: 36px; word-break: break-word } .default-heading2 { color: #1F2D3D; '+
                            'font-family: arial,helvetica,sans-serif; font-size: 32px; word-break: break-word }'+
                            '.default-heading3 { color: #1F2D3D; font-family: arial,helvetica,sans-serif; font-size: 24px;'+
                            'word-break: break-word } .default-heading4 { color: #1F2D3D; font-family: arial,helvetica,sans-serif;'+
                            'font-size: 18px; word-break: break-word } a[x-apple-data-detectors] '+
                            '{ color: inherit !important; text-decoration: inherit !important; font-size: inherit '+
                            '!important; font-family: inherit !important; font-weight: inherit !important; '+
                            'line-height: inherit !important; } .no-show-for-you { border: none; display: none; float: none; '+
                            'font-size: 0; height: 0; line-height: 0; max-height: 0; mso-hide: all; overflow: hidden; '+
                            'table-layout: fixed; visibility: hidden; width: 0; } </style><!--[if mso]><xml> '+
                            '<o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> '+
                            '</o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">a:link{color: #00e9c5;'+
                            'text-decoration: underline;}</style></head><body text="#3b3f44" link="#00e9c5" yahoo="fix" style=""> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" class="nl2go-body-table" width="100%" '+
                            'style="width: 100%;"><tr><td align="center" class="r0-c"> <table cellspacing="0" '+
                            'cellpadding="0" border="0" role="presentation" width="600" class="r1-o" '+
                            'style="table-layout: fixed; width: 600px;"><tr><td valign="top" class=""> '+
                            '<table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">'+
                            '<tr><td class="r2-c" align="center"> <table cellspacing="0" cellpadding="0" border="0" role="presentation"'+
                            'width="100%" class="r3-o" style="table-layout: fixed; width: 100%;"><!-- --><tr><td class="r4-i" '+
                            'style="background-color: #ffffff; padding-bottom: 20px; padding-top: 20px;"> <table width="100%" '+
                            'cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><th width="100%" valign="top" '+
                            'class="r5-c" style="font-weight: normal;"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;"><!-- -->'+
                            '<tr><td valign="top" class="r7-i" style="padding-left: 10px; padding-right: 10px;"> '+

                            '<tr> '+
                            '</td> </tr></table></th> </tr></table></td> </tr></table></td> </tr><tr><td class="r2-c" align="center"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r3-o" '+
                            'style="table-layout: fixed; width: 100%;"><!-- --><tr><td class="r8-i" style="background-color: #ffffff; '+
                            'padding-bottom: 20px; padding-top: 20px;"> <table width="100%" cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation"><tr><th width="100%" valign="top" class="r5-c" style="font-weight: normal;"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r6-o" '+
                            'style="table-layout: fixed; width: 100%;"><!-- --><tr><td valign="top" class="r7-i"> '+
                            '<table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation"><tr>'+
                            '<td class="r9-c" align="left"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="100%" class="r10-o" style="table-layout: fixed; width: 100%;"><tr>'+
                            '<td align="center" valign="top" class="r11-i nl2go-default-textstyle" style="color: #3b3f44; '+
                            'font-family: arial,helvetica,sans-serif; font-size: 16px; line-height: 1.5; word-break: break-word; padding-top: 15px;'+
                            'text-align: center;"> <div><h1 class="default-heading1" style="margin: 0; color: #1f2d3d; font-family: arial,helvetica,sans-serif;'+
                            'font-size: 36px; word-break: break-word;">Novo Orçamento Para Você!</h1></div> </td> </tr></table></td> '+
                            '</tr><tr><td class="r2-c" align="center"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="384" class="r3-o" style="table-layout: fixed; width: 384px;"><tr>'+
                            '<td class="r12-i" style="font-size: 0px; line-height: 0px; padding-bottom: 15px; padding-top: 15px;">'+
                            '<img src="https://www.ordemix.com.br/logo2.jpeg" width="384" border="0" class="" '+
                            'style="display: block; width: 100%;"></td> </tr></table></td> </tr><tr><td class="r9-c" align="left"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r10-o" '+
                            'style="table-layout: fixed; width: 100%;"><tr><td align="left" valign="top" class="r13-i '+
                            'nl2go-default-textstyle" style="color: #3b3f44; font-family: arial,helvetica,sans-serif; '+
                            'font-size: 16px; line-height: 1.5; word-break: break-word; padding-top: 15px; text-align: left;"> '+
                            '<div></div> </td> </tr></table></td> </tr><tr><td class="r9-c" align="left"> <table cellspacing="0" '+
                            'cellpadding="0" border="0" role="presentation" width="100%" class="r10-o" style="table-layout: fixed; '+
                            'width: 100%;"><tr><td align="left" valign="top" class="r14-i nl2go-default-textstyle" '+
                            'style="color: #3b3f44; font-family: arial,helvetica,sans-serif; font-size: 16px; line-height: 1.5;'+
                            'word-break: break-word; padding-bottom: 15px; padding-top: 15px; text-align: left;"> '+
                            '<div><p style="margin: 0;">Olá '+ usuarioDestino +
                            ', este é um e-mail enviado automaticamente. <p /> O Usuário <b>' + usuarioOrigem  + '</b>' +
                            ' criou um novo Orçamento para Analise. Para saber mais, basta acessar o site clicando no botão a baixo.'+
                            ' Ou acesse o site: https://ordemix.com.br </p>' +
                            '<br /> ' +
                            '<p style="margin: 12px;" > Detalhes do Orçamento: </p>'+
                            '<p style="margin: 12px; text-transform: uppercase; font-size: 11px;"> ' + descOrcamento + '</p>' +

                            '<p style="margin: 0;"> </p><p style="margin: 0;">Não responda este e-mail.</p></div> </td> </tr></table>'+
                            '</td> </tr><tr><td class="r2-c" align="center"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="300" class="r15-o" style="table-layout: fixed; width: 300px;">'+
                            '<tr class="nl2go-responsive-hide"><td height="15" style="font-size: 15px; line-height: 15px;">'+
                            '­</td> </tr><tr><td height="18" align="center" valign="top" class="r16-i nl2go-default-textstyle" '+
                            'style="color: #3b3f44; font-family: arial,helvetica,sans-serif; font-size: 16px; line-height: 1.5; '+
                            'word-break: break-word;">  <!--[if mso]> <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" '+
                            'xmlns:w="urn:schemas-microsoft-com:office:word" href="https://ordemix.com.br" '+
                            'style="v-text-anchor:middle; height: 41px; width: 299px;" arcsize="10%" fillcolor="#00e9c5" '+
                            'strokecolor="#00e9c5" strokeweight="1px" data-btn="1"> <w:anchorlock> </w:anchorlock> '+
                            '<v:textbox inset="0,0,0,0"> <div style="display:none;"> <center class="default-button">'+
                            '<p>Acesse o site</p></center> </div> </v:textbox> </v:roundrect> <![endif]-->  <!--[if !mso]><!-- -->'+
                            '<a href="https://ordemix.com.br" class="r17-r default-button" target="_blank" '+
                            'title="Ordemix" data-btn="1" style="font-style: normal; font-weight: bold; line-height: 1.15; '+
                            'text-decoration: none; word-break: break-word; border-style: solid; word-wrap: break-word; '+
                            'display: inline-block; -webkit-text-size-adjust: none; mso-hide: all; background-color: #00e9c5; '+
                            'border-color: #00e9c5; border-radius: 4px; border-width: 0px; color: #000000; font-family: arial,'+
                            'helvetica,sans-serif; font-size: 16px; height: 18px; padding-bottom: 12px; padding-left: 5px; '+
                            'padding-right: 5px; padding-top: 12px; width: 290px;"><p style="margin: 0;">Acesse o site</p></a> '+
                            '<!--<![endif]--> </td> </tr><tr class="nl2go-responsive-hide"><td height="15" style="font-size: 15px; '+
                            'line-height: 15px;">­</td> </tr></table></td> </tr></table></td> </tr></table></th> </tr></table></td> '+
                            '</tr></table></td> </tr><tr><td class="r2-c" align="center"> <table cellspacing="0" cellpadding="0" '+
                            'border="0" role="presentation" width="100%" class="r3-o" style="table-layout: fixed; width: 100%;"><!-- -->'+
                            '<tr><td class="r4-i" style="background-color: #ffffff; padding-bottom: 20px; padding-top: 20px;"> '+
                            '<table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><th width="100%" '+
                            'valign="top" class="r5-c" style="font-weight: normal;"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;"><!-- --><tr>'+
                            '<td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;"> <table width="100%" '+
                            'cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><td class="r18-c" align="center"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="570" class="r3-o" '+
                            'style="table-layout: fixed; width: 570px;"><!-- --><tr><td valign="top" class=""> <table width="100%" '+
                            'cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><td class="r19-c" '+
                            'style="display: inline-block;"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="570" class="r6-o" style="table-layout: fixed; width: 570px;"><!-- -->'+
                            '<tr><td class="r20-i" style="padding-bottom: 3px; padding-left: 249px; padding-right: 249px; '+
                            'padding-top: 3px;"> <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">'+
                            '<tr><th width="40" valign="" class="r21-c mobshow resp-table" style="font-weight: normal;"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r22-o" '+
                            'style="table-layout: fixed; width: 100%;"><!-- --><tr><td class="r23-i" style="font-size: 0px; '+
                            'line-height: 0px; padding-bottom: 5px; padding-top: 5px;"> <a href="https://instagram.com/marcalgyn" '+
                            'target="_blank" style="color: #00e9c5; text-decoration: underline;"> '+
                            '<img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_colored/instagram_32px.png" '+
                            'width="32" border="0" class="" style="display: block; width: 100%;"></a> </td> '+
                            '<td class="nl2go-responsive-hide" width="8" style="font-size: 0px; line-height: 1px;">­ '+
                            '</td> </tr> </table></th>'+
                            '<th width="32" valign="" class="r21-c mobshow resp-table" style="font-weight: normal;"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r24-o" '+
                            'style="table-layout: fixed; width: 100%;"><!-- --><tr><td class="r23-i" style="font-size: 0px; '+
                            'line-height: 0px; padding-bottom: 5px; padding-top: 5px;"> <a href="https://facebook.com.br/marcalgyn" '+
                            'target="_blank" style="color: #00e9c5; text-decoration: underline;"> '+
                            '<img src="https://creative-assets.mailinblue.com/editor/social-icons/rounded_colored/facebook_32px.png" '+
                            'width="32" border="0" class="" style="display: block; width: 100%;"></a> </td> </tr></table></th> </tr></table>'+
                            '</td> </tr></table></td> </tr></table></td> </tr></table></td> </tr></table></td> </tr></table></th> </tr></table>'+
                            '</td> </tr></table></td> </tr><tr> <td class="r2-c" align="center"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r3-o" '+
                            'style="table-layout: fixed; width: 100%;"><!-- --><tr><td class="r25-i" style="background-color: #eff2f7;"> '+
                            '<table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><th width="100%" '+
                            'valign="top" class="r5-c" style="font-weight: normal;"> <table cellspacing="0" cellpadding="0" border="0" '+
                            'role="presentation" width="100%" class="r6-o" style="table-layout: fixed; width: 100%;"><!-- --><tr>'+
                            '<td valign="top" class="r7-i" style="padding-left: 15px; padding-right: 15px;"> <table width="100%" '+
                            'cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><td class="r9-c" align="left"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r10-o" '+
                            'style="table-layout: fixed; width: 100%;"><tr><td align="center" valign="top" class="r26-i '+
                            'nl2go-default-textstyle" style="font-family: arial,helvetica,sans-serif; word-break: break-word; '+
                            'color: #3b3f44; font-size: 18px; line-height: 1.5; padding-top: 15px; text-align: center;"> <div>'+
                            '<p style="margin: 0;"><strong>Ordemix Controle de Ordens</strong></p></div> </td> </tr></table></td> </tr><tr>'+
                            '<td class="r9-c" align="left"> <table cellspacing="0" cellpadding="0" border="0" role="presentation" '+
                            'width="100%" class="r10-o" style="table-layout: fixed; width: 100%;"><tr><td align="center" valign="top" '+
                            'class="r27-i nl2go-default-textstyle" style="font-family: arial,helvetica,sans-serif; word-break: break-word; '+
                            'color: #3b3f44; font-size: 18px; line-height: 1.5; text-align: center;"> <div><p style="margin: 0; '+
                            'font-size: 14px;">e-mail gerado pelo sistema ordemix.com.br</p></div> </td> </tr></table></td> </tr><tr>'+
                            '<td class="r9-c" align="left"> <table cellspacing="0" cellpadding="0" border="0" role="presentation" '+
                            'width="100%" class="r10-o" style="table-layout: fixed; width: 100%;"><tr><td align="center" valign="top" '+
                            'class="r26-i nl2go-default-textstyle" style="font-family: arial,helvetica,sans-serif; '+
                            'word-break: break-word; color: #3b3f44; font-size: 18px; line-height: 1.5; padding-top: 15px; '+
                            'text-align: center;"> <div><p style="margin: 0; font-size: 14px;">Este e-mail foi enviado para {{contact.EMAIL}}</p>'+
                            '</div> </td> </tr></table></td> </tr><tr><td class="r9-c" align="left"> <table cellspacing="0" '+
                            'cellpadding="0" border="0" role="presentation" width="100%" class="r10-o" style="table-layout: fixed; width: 100%;">'+
                            '<tr><td align="center" valign="top" class="r27-i nl2go-default-textstyle" '+
                            'style="font-family: arial,helvetica,sans-serif; word-break: break-word; color: #3b3f44; font-size: 18px; '+
                            'line-height: 1.5; text-align: center;"> <div><p style="margin: 0; font-size: 14px;">'+
                            'Você o recebeu porque esta cadastrado em nosso sistema.</p></div> </td> </tr></table></td> </tr>'+
                            '<tr><td class="r9-c" align="left"> <table cellspacing="0" cellpadding="0" border="0" role="presentation" '+
                            'width="100%" class="r10-o" style="table-layout: fixed; width: 100%;"><tr><td align="center" valign="top" '+
                            'class="r28-i nl2go-default-textstyle" style="font-family: arial,helvetica,sans-serif; word-break: break-word; '+
                            'color: #3b3f44; font-size: 18px; line-height: 1.5; padding-bottom: 15px; padding-top: 15px; text-align: center;"> '+
                            '<div><p style="margin: 0; font-size: 14px;"><a href="{{ mirror }}" style="color: #00e9c5; text-decoration: underline;">'+
                            'Visualizar no navegador</a> </p></div> </td> </tr></table></td> </tr><tr><td class="r18-c" align="center"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="100%" class="r3-o" '+
                            'style="table-layout: fixed; width: 100%;"><tr><td valign="top" class="r29-i" style="padding-bottom: 15px;"> '+
                            '<table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation"><tr><td class="r30-c" align="center"> '+
                            '<table cellspacing="0" cellpadding="0" border="0" role="presentation" width="129" class="r31-o" style="table-layout: fixed;">'+
                            '<tr><td height="48" class="" style="font-size: 0px; line-height: 0px;"> '+
                            '<img src="https://creative-assets.mailinblue.com/rnb-assets/pt.png" width="129" border="0" class="" '+
                            'style="display: block; width: 100%;"></td> </tr></table></td> </tr></table></td> </tr></table></td> </tr></table></td> '+
                            '</tr></table></th> </tr></table></td> </tr></table></td> </tr></table></td> </tr></table></td> </tr></table></body></html>',

            'params' : {'bodyMessage':'Nova Tarefa para Você'}
          }
        ).then(function(data) {
          console.log('API envio de Email realizado com sucesso. Retorno dados: ' + JSON.stringify(data));
        }, function(error) {
          console.error(error);
        });

        /* BLoco de email via template */
        var apiInstanceEmail = new SibApiV3Sdk.TransactionalEmailsApi();
        var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail = {
            to: [{
                email:  'contato@marcalgyn.com.br',
                name: 'Sistema Ordemix'
            }],
            templateId: 2,
            params: {
                name: empresa,
                surname: ''
            },
            headers: {
              'htmlContent' : 'Email',
              'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
            },

        };
        apiInstanceEmail.sendTransacEmail(sendSmtpEmail).then(function(data) {
          console.log('Email enviado com sucesso. Enviado data: ' + JSON.stringify(data));
        }, function(error) {
          console.error(error);
        });

      } else {
        const ordemServico = await OrdemServico.findOrFail(request.input("id"));
        ordemServico.prioridade = request.input("prioridade");
        ordemServico.empOrigem = request.input("empOrigem");
        ordemServico.usuOrigem = request.input("usuOrigem");
        ordemServico.empDestino = request.input("empDestino");
        ordemServico.usuDestino = request.input("usuDestino");
        ordemServico.depDestino = request.input("depDestino");
        ordemServico.descricao = request.input("descricao");
        ordemServico.formaPagamento = request.input("formaPagamento");
        
        let str = request.input("valor")
        console.log(str);
        ordemServico.valor = str.replace(/,/g, '');
        console.log(str);


        

        ordemServico.dataOrigem = this.convertStrToDateTime(
          request.input("dataOrigem")
        );
        ordemServico.dataRealizado =
          request.input("dataRealizado") !== undefined && request.input("dataRealizado") !== null
            ? this.convertStrToDateTime(request.input("dataRealizado"))
            : null;
        ordemServico.dataConclusao =
          request.input("dataConclusao") !== undefined && request.input("dataConclusao") !== null
            ? this.convertStrToDateTime(request.input("dataConclusao"))
            : null;
        ordemServico.statusOrdemServico = request.input("statusOrdemServico");
        ordemServico.statusProgresso = request.input("statusProgresso");
        if (imagemAbertura !== "") {
          ordemServico.urlOrigem = imagemAbertura;
        }
        if (imagemConclusao !== "") {
          ordemServico.urlFinal = imagemConclusao;
        }

        if (imagem2Abertura !== "") {
          ordemServico.urlOrigem2 = imagem2Abertura;
        }
        if (imagem2Conclusao !== "") {
          ordemServico.urlFinal2 = imagem2Conclusao;
        }

        if (
          request.input("statusOrdemServico") == "Realizado" &&
          ( request.input("dataConclusao") == "" || request.input("dataConclusao") === undefined || request.input("dataConclusao") === null )
        ) {
          ordemServico.dataConclusao = DateTime.now();
        }

        await ordemServico.save();

        session.flash("notification", "Orçamento alterado com sucesso!");
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
    const ordemServico = await OrdemServico.findOrFail(params.id);

    ordemServico.statusOrdemServico = "Reprovado";
    ordemServico.dataConclusao = DateTime.now();
    await ordemServico.save();

    // await ordemServico.delete();

    session.flash("notification", "Orçamento Cancelado com sucesso!");

    return response.redirect("back");
  }

  public async lista({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.all();
    const page = request.input("page", 1);
    const limit = 50;

    const ordemServicos = await OrdemServico.query()

      .select("ordens_servicos.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .join("empresas", "empresas.id", "=", "ordens_servicos.emp_destino")
      .join("pessoas", "pessoas.id", "=", "ordens_servicos.usu_destino")
      .join(
        "departamentos",
        "departamentos.id",
        "=",
        "ordens_servicos.dep_destino"
      )
      .andWhere("ordens_servicos.status_ordem_servico", "Completo")
      .orderBy("data_conclusao", "desc")
      .paginate(page, limit);

    ordemServicos.baseUrl("lista");

    return view.render("listaordemServico", {
      ordemServicos,
      empresas,
      departamentos,
      pessoas,
    });
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
    const depDestino = request.input("depOrdemServico");

    const ordemServicos = await OrdemServico.query()
      .join("empresas", "empresas.id", "=", "ordens_servicos.emp_destino")
      .join("pessoas", "pessoas.id", "=", "ordens_servicos.usu_destino")
      .join(
        "departamentos",
        "departamentos.id",
        "=",
        "ordens_servicos.dep_destino"
      )
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
          query.andWhere("depDestino", depDestino);
        }
      })
      .andWhere("ordens_servicos.status_ordem_servico", "Completo")
      .select("ordens_servicos.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .orderBy("data_conclusao")
      .paginate(page, limit);

    ordemServicos.baseUrl("lista");

    return view.render("listaordemServico", {
      ordemServicos,
      pessoas,
      empresas,
      departamentos,
    });
  }

  public async listaOrcamento({request, view} : HttpContextContract){
 

  }

  /**
   * Retorna um DateTime Luxon
   */
  public convertStrToDateTime(dataInput: string): any {
    const dataLuxon = DateTime.fromISO(dataInput);
    return dataLuxon;
  }

  public normalizaNomeImagem(value: string): string {
    return (
      moment().format("DDMMYYYYHHmmss") +
      "_" +
      value.normalize("NFD").split(" ").join("")
    );
  }
}
