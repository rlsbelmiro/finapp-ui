import { ApiService } from './ApiService'

const endpoint = 'fluxocaixa';

export const FluxoCaixaService = {
    getValores(filtro){
        return ApiService.post(endpoint + '/obterTotais',filtro);
    },
    getValoresCarteira(filtro){
        return ApiService.post(endpoint + '/obterTotaisCarteira',filtro);
    },
    gerarExcel(objeto){
        return ApiService.post(endpoint + '/gerarExcel',objeto);
    },
    gerarPdf(objeto){
        return ApiService.post(endpoint + '/gerarPdf',objeto);
    }
}