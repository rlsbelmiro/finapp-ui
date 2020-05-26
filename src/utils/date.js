

export function getPeriodosFluxoCaixa(qtd, tipoPeriodo, dataInicial) {
    if (!tipoPeriodo)
        tipoPeriodo = 'Mês';
    var periodos = new Array();
    var periodoInicio = new Date();
    periodoInicio.setDate(1);
    if (dataInicial)
        periodoInicio = dataInicial;

    let soma = getSomaPeriodo(tipoPeriodo);
    let mesFimPrimeiroPeriodo = soma === 1 ? periodoInicio.getMonth() : periodoInicio.getMonth() + (soma - 1);
    var periodoFim = new Date(periodoInicio.getFullYear(), mesFimPrimeiroPeriodo, getUltimoDiaMes(mesFimPrimeiroPeriodo));

    for (var x = 1; x <= qtd; x++) {
        periodos.push({
            saldoAnterior: 0,
            fluxoCaixa: 0,
            periodoInicio: Intl.DateTimeFormat("pt-BR").format(periodoInicio),
            periodoFim: Intl.DateTimeFormat("pt-BR").format(periodoFim),
            label: getNomePeriodo(periodoInicio.getMonth(), periodoInicio.getFullYear(), tipoPeriodo)
        });

        periodoFim.setMonth(periodoFim.getMonth() + soma, getUltimoDiaMes(periodoFim.getMonth() + soma));
        periodoInicio.setMonth(periodoInicio.getMonth() + soma, 1);
    }

    return periodos;
}

function getSomaPeriodo(tipoPeriodo) {
    let retorno = 1;
    switch (tipoPeriodo) {
        case 'Bimestre':
            retorno = 2;
            break;
        case 'Trimestre':
            retorno = 3;
            break;
        case 'Semestre':
            retorno = 6;
            break;
        case 'Ano':
            retorno = 12;
            break;
    }
    return retorno;
}

export function formatarDataIngles(dataString) {
    if (dataString == null)
        return '';
    var data = dataString.split('/');
    return data[2] + '-' + data[1] + '-' + data[0];
}

export function formatarDataBR(dataString) {
    if (dataString == null)
        return '';

    var index = dataString.indexOf('T');
    if (index > -1) {
        dataString = dataString.substring(0, index);
    }
    var data = dataString.split('-')
    return data[2] + '/' + data[1] + '/' + data[0];
}

export function getDescricaoMes(mes, ano) {
    let retorno = "";
    switch (mes) {
        case 1:
            retorno = "Janeiro " + ano;
            break;
        case 2:
            retorno = "Fevereiro " + ano;
            break;
        case 3:
            retorno = "Março " + ano;
            break;
        case 4:
            retorno = "Abril " + ano;
            break;
        case 5:
            retorno = "Maio " + ano;
            break;
        case 6:
            retorno = "Junho " + ano;
            break;
        case 7:
            retorno = "Julho " + ano;
            break;
        case 8:
            retorno = "Agosto " + ano;
            break;
        case 9:
            retorno = "Setembro " + ano;
            break;
        case 10:
            retorno = "Outubro " + ano;
            break;
        case 11:
            retorno = "Novembro " + ano;
            break;
        case 12:
            retorno = "Dezembro " + ano;
            break;
    }
    return retorno;
}

function getNomePeriodo(value, ano, tipoPeriodo) {
    var retorno = "JAN " + ano;
    if (tipoPeriodo === 'Mês') {
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
    }
    else if (tipoPeriodo === 'Bimestre') {
        switch (value) {
            case 0:
                retorno = "JAN - FEV " + ano;
                break;
            case 1:
                retorno = "FEV - MAR" + ano;
                break;
            case 2:
                retorno = "MAR - ABR " + ano;
                break;
            case 3:
                retorno = "ABR - MAI " + ano;
                break;
            case 4:
                retorno = "MAI - JUN " + ano;
                break;
            case 5:
                retorno = "JUN - JUL " + ano;
                break;
            case 6:
                retorno = "JUL - AGO " + ano;
                break;
            case 7:
                retorno = "AGO - SET " + ano;
                break;
            case 8:
                retorno = "SET - OUT " + ano;
                break;
            case 9:
                retorno = "OUT - NOV " + ano;
                break;
            case 10:
                retorno = "NOV - DEZ " + ano;
                break;
            case 11:
                retorno = "DEZ " + ano + " - JAN " + (ano + 1);
                break;
        }
    }
    else if (tipoPeriodo === 'Trimestre') {
        switch (value) {
            case 0:
                retorno = "JAN - MAR " + ano;
                break;
            case 1:
                retorno = "FEV - ABR" + ano;
                break;
            case 2:
                retorno = "MAR - MAI " + ano;
                break;
            case 3:
                retorno = "ABR - JUN " + ano;
                break;
            case 4:
                retorno = "MAI - JUL " + ano;
                break;
            case 5:
                retorno = "JUN - AGO " + ano;
                break;
            case 6:
                retorno = "JUL - SET " + ano;
                break;
            case 7:
                retorno = "AGO - OUT " + ano;
                break;
            case 8:
                retorno = "SET - NOV " + ano;
                break;
            case 9:
                retorno = "OUT - DEZ " + ano;
                break;
            case 10:
                retorno = "NOV " + ano + " - JAN " + (ano + 1);
                break;
            case 11:
                retorno = "DEZ " + ano + " - FEV " + (ano + 1);
                break;
        }
    }
    else if (tipoPeriodo === 'Semestre') {
        switch (value) {
            case 0:
                retorno = "JAN - JUN " + ano;
                break;
            case 1:
                retorno = "FEV - JUL" + ano;
                break;
            case 2:
                retorno = "MAR - AGO " + ano;
                break;
            case 3:
                retorno = "ABR - SET " + ano;
                break;
            case 4:
                retorno = "MAI - OUT " + ano;
                break;
            case 5:
                retorno = "JUN - NOV " + ano;
                break;
            case 6:
                retorno = "JUL - DEZ " + ano;
                break;
            case 7:
                retorno = "AGO " + ano + " - JAN " + (ano + 1);
                break;
            case 8:
                retorno = "SET " + ano + " - FEV " + (ano + 1);
                break;
            case 9:
                retorno = "OUT " + ano + " - MAR " + (ano + 1);
                break;
            case 10:
                retorno = "NOV " + ano + " - ABR " + (ano + 1);
                break;
            case 11:
                retorno = "DEZ " + ano + " - MAI " + (ano + 1);
                break;
        }
    }
    else if (tipoPeriodo === 'Ano') {
        switch (value) {
            case 0:
                retorno = "JAN " + ano + " - DEZ " + (ano);
                break;
            case 1:
                retorno = "FEV " + ano + " - JAN " + (ano + 1);
                break;
            case 2:
                retorno = "MAR " + ano + " - FEV " + (ano + 1);
                break;
            case 3:
                retorno = "ABR " + ano + " - MAR " + (ano + 1);
                break;
            case 4:
                retorno = "MAI " + ano + " - ABR " + (ano + 1);
                break;
            case 5:
                retorno = "JUN " + ano + " - MAI " + (ano + 1);
                break;
            case 6:
                retorno = "JUL " + ano + " - JUN " + (ano + 1);
                break;
            case 7:
                retorno = "AGO " + ano + " - JUL " + (ano + 1);
                break;
            case 8:
                retorno = "SET " + ano + " - AGO " + (ano + 1);
                break;
            case 9:
                retorno = "OUT " + ano + " - SET " + (ano + 1);
                break;
            case 10:
                retorno = "NOV " + ano + " - OUT " + (ano + 1);
                break;
            case 11:
                retorno = "DEZ " + ano + " - NOV " + (ano + 1);
                break;
        }
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