import { ApiService } from './ApiService'

const endpoint = 'documents';

export const LancamentoService = {
    list(mes, ano) {
        return ApiService.get(endpoint + '/getByMonth/' + mes + '/' + ano);
    },
    get(id) {
        return ApiService.getById(endpoint, id);
    },
    getFiltros() {
        return ApiService.get(endpoint + '/filters');
    },
    getPorFatura(faturaId) {
        return ApiService.get(endpoint + '/faturaCartao/' + faturaId);
    },
    create(lancamento) {
        return ApiService.post(endpoint, lancamento);
    },
    remove(id) {
        return ApiService.delete(endpoint, id);
    },
    edit(lancamento, id) {
        return ApiService.put(endpoint, lancamento, id);
    },
    pesquisar(filtro) {
        return ApiService.post(endpoint + '/search', filtro);
    },
    agruparCartao(isAgrupar, lancamentos, agrupados) {
        var filtro = {
            agruparCartao: isAgrupar,
            listaAgrupar: lancamentos,
            itensAgrupados: agrupados
        }
        return ApiService.post(endpoint + '/agruparCartao', filtro);
    },
    calendar(mes, ano) {
        let periodo = (mes && ano) ? mes + ',' + ano : "1";
        return ApiService.get(endpoint + '/calendar/' + periodo);
    }
}