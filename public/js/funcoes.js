
function limpa_formulario_cep() {
    //Limpa valores do formulário de cep.
    document.getElementById('endereco').value = ("");
    document.getElementById('bairro').value = ("");
    document.getElementById('cidade').value = ("");
    document.getElementById('estado').value = ("");

}

function meu_callback(conteudo) {
    if (!("erro" in conteudo)) {
        //Atualiza os campos com os valores.
        document.getElementById('logradouro').value = (conteudo.logradouro);
        document.getElementById('bairro').value = (conteudo.bairro);
        document.getElementById('cidade').value = (conteudo.localidade);
        document.getElementById('uf').value = (conteudo.uf);
    } //end if.
    else {
        //CEP não Encontrado.
        limpa_formulario_cep();
        alert("CEP não encontrado.");
        document.getElementById('cep').value = ("");
    }
}

function pesquisacep(valor) {

    //Nova variável "cep" somente com dígitos.
    var cep = valor.replace(/\D/g, '');

    //Verifica se campo cep possui valor informado.
    if ((cep !== "" && cep !== "0")) {
        //Expressão regular para validar o CEP.
        var validacep = /^[0-9]{8}$/;

        //Valida o formato do CEP.
        if (validacep.test(cep)) {

            //Preenche os campos com "..." enquanto consulta webservice.
            document.getElementById('logradouro').value = "...";
            document.getElementById('bairro').value = "...";
            document.getElementById('cidade').value = "...";
            document.getElementById('uf').value = "...";

            //Cria um elemento javascript.
            var script = document.createElement('script');

            //Sincroniza com o callback.
            script.src = '//viacep.com.br/ws/' + cep + '/json/?callback=meu_callback';

            //Insere script no documento e carrega o conteúdo.
            document.body.appendChild(script);

        } //end if.
        else {
            //cep é inválido.
            limpa_formulario_cep();
            alert("Formato de CEP inválido.");
        }
    } //end if.
    else {
        //cep sem valor, limpa formulário.
        //  limpa_formulario_cep();
    }
}



function formatar(mascara, documento) {
    var i = documento.value.length;
    var saida = mascara.substring(0, 1);
    var texto = mascara.substring(i);

    if (texto.substring(0, 1) != saida) {
        documento.value += texto.substring(0, 1);
    }

}


function formataMoeda(valor) {
    const options = {
        style : "decimal",
        currency : "BRL",
        minimumIntegerDigits : 10,
        minimumFractionDigits : 2,
        maximumFractionDigits: 5,
    }
    
    //Com Cifrão   
   //  var valorFormatado = parseFloat(valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    //sem R$
    var valorFormatado = valor.toLocaleString('en-us', { minimumFractionDigits: 2 });

    return valorFormatado;
}

function tratadata(valor) {
    
    if (valor.length <= 10) {

    } else {
        d = new Date(valor);
        dt = d.getDate();
        mn = d.getMonth();
        mn++;
        yy = d.getFullYear();

        return dt + "/" + mn + "/" + yy;

        //document.getElementById("dtNascimento").value = dt + "/" + mn + "/" + yy
    }


}

function idade(valor) {
    var data = valor; //document.getElementById("dtNascimento").value;
    alert(valor)
    var dia = data.substr(0, 2);
    var mes = data.substr(3, 2);
    var ano = data.substr(6, 4);
    var d = new Date();
    var ano_atual = d.getFullYear(),
        mes_atual = d.getMonth() + 1,
        dia_atual = d.getDate();

    ano = +ano,
        mes = +mes,
        dia = +dia;

    var idade = ano_atual - ano;

    if (mes_atual < mes || mes_atual == mes_aniversario && dia_atual < dia) {
        idade--;
    }
    alert(idade)
    return idade;
}

function exibe(i) {
    document.getElementById(i).readOnly = true;

}

function desabilita(i) {

    document.getElementById(i).disabled = true;
}
function habilita(i) {
    document.getElementById(i).disabled = false;
}

//const conexao = require("../config/connMySql");

function showhide() {
    var div = document.getElementById("newpost");

    if (idade() >= 18) {

        div.style.display = "none";
    }
    else if (idade() < 18) {
        div.style.display = "inline";
    }

}


function mascaraTelefone(propriedade) {

    if (propriedade) {
        var phone = propriedade.toString();

        if (phone.substr(0, 1) == "(") {
            return phone;
        }

        if (phone.substr(0, 1) == '+') {
            document.getElementById('telefone').value = "(+" + phone.substr(1, 2) + ") " + phone.substr(3, 11);
        } else {
            document.getElementById('telefone').value = "(" + phone.substr(0, 2) + ") " + phone.substr(2, 5) + "-" + phone.substr(7, 8);
        }

    } else {
        document.getElementById('telefone').value = "0";
    }
}

// Somente Numero
function onlynumber(evt) {
   var theEvent = evt || window.event;
   var key = theEvent.keyCode || theEvent.which;
   key = String.fromCharCode( key );
   //var regex = /^[0-9.,]+$/;
   var regex = /^[0-9.]+$/;
   if( !regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
   }
}











