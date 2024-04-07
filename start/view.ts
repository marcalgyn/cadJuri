import View from "@ioc:Adonis/Core/View";
import { DateTime } from "luxon";

View.global("formatDate", function (date: DateTime) {
  if (date) {
    return date.toLocaleString();
  } else {
    return "";
  }
});

View.global("formatDateTime", function (date: DateTime) {
  if (date) {
    return date.toLocaleString({
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return "";
  }
});

View.global("formatCurrency", function (valor: number) {
  if (valor){
    return valor.toLocaleString("pt-br", { style: "currency", currency: "BRL" });
  } else {
    return "R$ 0.00";
  }

});

View.global("formatCnpj", function (strCnpj: string) {
  if (strCnpj.length === 14) {
    strCnpj = strCnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  } else if (strCnpj.length < 14) {
    const diff = 14 - strCnpj.length;
    for (let index = 0; index < diff; index++) {
      strCnpj = "0" + strCnpj;
    }
    strCnpj = strCnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return strCnpj;
});
