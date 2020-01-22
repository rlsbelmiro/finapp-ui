

export function getPeriodosFluxoCaixa(qtd) {
    var periodos = new Array();
    var periodoInicio = new Date();
    periodoInicio.setDate(1);
    var periodoFim = new Date(periodoInicio.getFullYear(),periodoInicio.getMonth(),getUltimoDiaMes(periodoInicio.getMonth()));
    

    for(var x = 1; x <= qtd; x++){
        periodos.push({
            periodoInicio: Intl.DateTimeFormat("pt-BR").format(periodoInicio),
            periodoFim: Intl.DateTimeFormat("pt-BR").format(periodoFim),
            label: getNomePeriodo(periodoInicio.getMonth(),periodoInicio.getFullYear())
        });
        periodoFim.setMonth(periodoFim.getMonth() + 1,getUltimoDiaMes(periodoFim.getMonth() + 1));
        periodoInicio.setMonth(periodoInicio.getMonth() + 1,1);
    }

    return periodos;
}

export function formatarDataIngles(dataString){
    if(dataString == null)
        return '';
    var data = dataString.split('/');
    return data[2] + '-' + data[1] + '-' + data[0];
}

export function formatarDataBR(dataString){
    var data = new Date(dataString);
    var dia  = data.getDate().toString().padStart(2, '0');
    var mes  = (data.getMonth()+1).toString().padStart(2, '0'); //+1 pois no getMonth Janeiro começa com zero.
    var ano  = data.getFullYear();
    return dia+'/'+mes+'/'+ano;
}

function getNomePeriodo(value,ano){
    var retorno = "Janeiro " + ano;
    switch (value) {
        case 1:
            retorno = "Fevereiro " + ano;
            break;
        case 2:
            retorno = "Março " + ano;
            break;
        case 3:
            retorno = "Abril " + ano;
            break;
        case 4:
            retorno = "Maio " + ano;
            break;
        case 5:
            retorno = "Junho " + ano;
            break;
        case 6:
            retorno = "Julho " + ano;
            break;
        case 7:
            retorno = "Agosto " + ano;
            break;
        case 8:
            retorno = "Setembro " + ano;
            break;
        case 9:
            retorno = "Outubro " + ano;
            break;
        case 10:
            retorno = "Novembro " + ano;
            break;
        case 11:
            retorno = "Dezembro " + ano;
            break;
    }

    return retorno;
}

function getUltimoDiaMes(mes) {
    var dia = 30;
    switch (mes) {
        case 0:
        case 2:
        case 4:
        case 5:
        case 6:
        case 7:
        case 9:
        case 11:
            dia = 31;
            break;
        case 3:
        case 8:
        case 10:
            dia = 30;
            break;
        case 1:
            dia = 28;
            break;
    }
    return dia;
}