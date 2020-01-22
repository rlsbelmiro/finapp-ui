import { ApiService } from './ApiService'

const endpoint = 'caixa';

export const CaixaService = {
    obterSaldo(){
        return ApiService.get(endpoint + '/saldoAtual');
    },
    obterSaldoAteData(data){
        return ApiService.get(endpoint + '/saldoAteData/' + data);
    }
}