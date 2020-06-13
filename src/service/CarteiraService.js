import { ApiService } from './ApiService'

const endpoint = 'wallets';

export const CarteiraService = {
    list() {
        return ApiService.get(endpoint);
    },
    create(newCourse) {
        return ApiService.post(endpoint, newCourse);
    },
    remove(id) {
        return ApiService.delete(endpoint, id);
    }
}