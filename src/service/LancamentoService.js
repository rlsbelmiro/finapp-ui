import { ApiService } from './ApiService'

const endpoint = 'lancamentos';

export const LancamentoService = {
    list(){
        return ApiService.get(endpoint  + '/mesAtual');
    },
    get(id){
        return ApiService.getById(endpoint,id);
    },
    getFiltros(){
        return ApiService.get(endpoint + '/getFiltros');
    },
    getPorFatura(faturaId){
        return ApiService.get(endpoint + '/faturaCartao/' + faturaId);
    },
    create(lancamento){
        return ApiService.post(endpoint + '/salvar',lancamento);
    },
    remove(id){
        return ApiService.delete(endpoint,id);
    },
    edit(lancamento,id){
        return ApiService.put(endpoint + '/salvar',lancamento,id);
    },
    pay(lancamento){
        return ApiService.post(endpoint + '/pagar',lancamento);
    },
    cancelPay(lancamento){
        return ApiService.get(endpoint + '/cancelarPagamento/' + lancamento);
    },
    pesquisar(filtro){
        return ApiService.post(endpoint + '/pesquisar',filtro);
    },
    agruparCartao(isAgrupar, lancamentos, agrupados){
        var filtro = {
            agruparCartao: isAgrupar,
            listaAgrupar: lancamentos,
            itensAgrupados: agrupados
        }
        return ApiService.post(endpoint + '/agruparCartao', filtro);
    }
}