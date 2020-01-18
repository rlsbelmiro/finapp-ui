import { ApiService } from './ApiService'

const endpoint = 'fluxocaixa';

export const FluxoCaixaService = {
    getValores(filtro){
        return ApiService.post(endpoint + '/obterTotais',filtro);
    }
}