import { ApiService } from './ApiService'

const endpoint = 'agenda';

export const AgendaService = {
    list(mes,ano){
        if(mes != null && ano != null){
            return ApiService.get(endpoint + '/' + mes + ',' + ano);
        }
        return ApiService.get(endpoint);
    },
    pesquisar(filtro){
        return ApiService.post(endpoint + '/pesquisar',filtro);
    },
}