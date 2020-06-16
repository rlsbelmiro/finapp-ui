import { ApiService } from './ApiService'

const endpoint = 'payments';

export const CaixaService = {
    obterSaldo() {
        return ApiService.get(endpoint + '/balance');
    },
    obterSaldoAteData(data) {
        return ApiService.get(endpoint + '/saldoAteData/' + data);
    },
    payOne(payment) {
        return ApiService.post(endpoint, payment)
    },
    cancel(id) {
        return ApiService.get(endpoint + '/cancel/' + id);
    }
}