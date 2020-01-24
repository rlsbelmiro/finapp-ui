import { ApiService } from './ApiService'

const endpoint = 'fluxocaixa';

export const FluxoCaixaService = {
    getValores(filtro){
        return ApiService.post(endpoint + '/obterTotais',filtro);
    },
    getValoresCarteira(filtro){
        return ApiService.post(endpoint + '/obterTotaisCarteira',filtro);
    }
}