import { ApiService } from './ApiService'

const endpoint = 'creditcards';

export const CartaoDeCreditoService = {
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