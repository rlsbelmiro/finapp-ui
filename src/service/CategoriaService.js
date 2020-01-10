import { ApiService } from './ApiService'

const endpoint = 'categorias';

export const CategoriaService = {
    listAnaliticas(tipo){
        return ApiService.get(endpoint + "/analiticas/" + tipo);
    },
    listNaoAnaliticas(tipo){
        return ApiService.get(endpoint + "/naoAnaliticas/" + tipo);
    },
    get(id){
        return ApiService.get(endpoint + "/" + id);
    },
    create(categoria){
        console.log(JSON.stringify(categoria));
        return ApiService.post(endpoint + '/salvar',categoria);
    }
}