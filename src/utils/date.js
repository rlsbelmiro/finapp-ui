

export function getPeriodosFluxoCaixa(qtd) {
    var periodos = new Array();
    var periodoInicio = new Date();
    periodoInicio.setDate(1);
    var periodoFim = new Date(periodoInicio.getFullYear(),periodoInicio.getMonth(),getUltimoDiaMes(periodoInicio.getMonth()));
    

    for(var x = 1; x <= qtd; x++){
        periodos.push({
            saldoAnterior: 0,
            fluxoCaixa: 0,
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
    if(dataString == null)
        return '';
    var data = dataString.split('-')
    return data[2]+'/'+data[1]+'/'+data[0];
}

function getNomePeriodo(value,ano){
    var retorno = "JAN " + ano;
    switch (value) {
        case 1:
            retorno = "FEV " + ano;
            break;
        case 2:
            retorno = "MAR " + ano;
            break;
        case 3:
            retorno = "ABR " + ano;
            break;
        case 4:
            retorno = "MAI " + ano;
            break;
        case 5:
            retorno = "JUN " + ano;
            break;
        case 6:
            retorno = "JUL " + ano;
            break;
        case 7:
            retorno = "AGO " + ano;
            break;
        case 8:
            retorno = "SET " + ano;
            break;
        case 9:
            retorno = "OUT " + ano;
            break;
        case 10:
            retorno = "NOV " + ano;
            break;
        case 11:
            retorno = "DEZ " + ano;
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
        case 6:
        case 7:
        case 9:
        case 11:
            dia = 31;
            break;
        case 3:
        case 5:
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