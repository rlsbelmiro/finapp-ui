import { ApiService } from './ApiService'

const endpoint = 'categorias';

export const CategoriaService = {
    listAnaliticas(tipo){
        return ApiService.get(endpoint + "/analiticas/" + tipo);
    }
}