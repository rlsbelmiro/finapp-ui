import { ApiService } from './ApiService'

const endpoint = 'caixa';

export const CaixaService = {
    obterSaldo(){
        return ApiService.get(endpoint + '/saldoAtual');
    }
}