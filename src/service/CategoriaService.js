import { ApiService } from './ApiService'

const endpoint = 'categories';

export const CategoriaService = {
    listAnaliticas(tipo) {
        return ApiService.get(endpoint + "/analytics/" + tipo);
    },
    listNaoAnaliticas(tipo) {
        return ApiService.get(endpoint + "/naoAnaliticas/" + tipo);
    },
    get(id) {
        return ApiService.get(endpoint + "/" + id);
    },
    create(categoria) {
        return ApiService.post(endpoint + '/salvar', categoria);
    },
    listAtivas() {
        return ApiService.get(endpoint + '/ativas');
    }
}