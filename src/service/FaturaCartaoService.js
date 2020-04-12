import { ApiService } from './ApiService'

const endpoint = 'faturaCartao';

export const FaturaCartaoService = {
    get(id){
        return ApiService.get(endpoint + '/' + id);
    },
    getLimite(id){
        return ApiService.get(endpoint + '/obterLimite/' + id);
    },
    pay(faturaPagamento){
        return ApiService.post(endpoint + '/pagarFatura',faturaPagamento);
    },
    updateAmount(faturaId, valor, categoriaCredito, categoriaDebito){
        var fatura = {
            id: faturaId,
            valorFatura: valor,
            categoriaDifCredito: categoriaCredito,
            categoriaDifDebito: categoriaDebito
        }

        return ApiService.post(endpoint + '/atualizarValor',fatura);
    },
    updateDeadline(faturaId, vencimento,vencimentoFormatadoBR){
        var fatura = {
            id: faturaId,
            vencimento: vencimento,
            vencimentoFormatado: vencimentoFormatadoBR
        }
        console.log(JSON.stringify(fatura));
        return ApiService.post(endpoint + '/atualizarVencimento',fatura);
    }
}