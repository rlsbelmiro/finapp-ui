import { ApiService } from './ApiService'

const endpoint = 'acesso';

export const AcessoService = {
    autenticar(login,senha){
        let data = {
            login: login,
            senha: senha
        };
        return ApiService.postForm(endpoint + '/autenticar',data);
    }
}