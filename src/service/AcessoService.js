import { ApiService } from './ApiService'

const endpoint = 'account';

export const AcessoService = {
    autenticar(login, password) {
        let data = {
            login: login,
            password: password
        };
        return ApiService.post(endpoint + '/login', data);
    }
}