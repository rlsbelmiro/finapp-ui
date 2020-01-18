import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import { CategoriaService } from '../../service/CategoriaService';
import { FluxoCaixaService } from '../../service/FluxoCaixaService';
import { CaixaService } from '../../service/CaixaService';


class FluxoCaixa extends Component {

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);

        this.state = {
            fluxo: [
                {
                    saldoAnterior: 0,
                    fluxoCaixa: 0,
                    registros: [{
                        id: 0,
                        nome: '',
                        analitico: false,
                        valor: 0,
                        categoriaSuperiorId: 0,
                        calculada: false
                    }]
                }
            ],
            filtro: {
                periodoInicio: '',
                periodoFim: '',
                categorias: []
            },
            aguardar: true
        }
    }

    componentDidMount() {
        this.onLoad()
    };

    async onLoad() {
        let { filtro } = this.state;
        filtro.categorias = new Array();
        var resposta = await CategoriaService.listAtivas();
        if (resposta.sucesso) {
            resposta.objeto.map(function (c, index) {
                if (c.analitico) {
                    filtro.categorias.push(c);
                }
            });
            filtro.periodoInicio = '2020-01-01';
            filtro.periodoFim = '2020-01-31';
            var respFluxo = await FluxoCaixaService.getValores(filtro);
            if (respFluxo.sucesso) {
                var fl = new Array();
                var temp = respFluxo.objeto;
                for (var x = 0; x < temp.length; x++) {
                    var f = temp[x];
                    fl.push({
                        id: f.categoria.id,
                        nome: f.categoria.numeracao + ' ' + f.categoria.nome.toString().toUpperCase(),
                        analitico: f.categoria.analitico,
                        valor: f.valor,
                        categoriaSuperiorId: f.categoria.categoriaSuperiorId,
                        calculada: f.categoria.analitico
                    })
                }

                var contador = 0;
                do {
                    temp = fl.filter(x => !x.calculada);
                    for (var x = 0; x < temp.length; x++) {
                        var f = temp[x];
                        var calculadas = fl.filter(o => o.categoriaSuperiorId == f.id && o.calculada);
                        var totalCategorias = fl.filter(o => o.categoriaSuperiorId == f.id).length;
                        if (calculadas.length == totalCategorias) {
                            var contas = "";
                            var total = 0;
                            calculadas.map(m => total += m.valor);
                            fl.forEach(m => {
                                if (m.id === f.id) {
                                    m.valor = total;
                                    m.calculada = true;
                                }
                            });
                            console.log(JSON.stringify({ id: f.id, calculadas: calculadas.length }));
                            total = 0;
                        }
                    }
                    contador++;
                } while (fl.filter(x => !x.calculada).length > 0);


                var saldoAnterior = await CaixaService.obterSaldo();
                var vlSaldoAnterior = 0;
                if (saldoAnterior.sucesso) {
                    vlSaldoAnterior = saldoAnterior.objeto.saldo;
                }

                var vlFluxo = vlSaldoAnterior;
                fl.filter(f => f.categoriaSuperiorId == 0).forEach(x => {
                    vlFluxo += x.valor;
                });

                var fluxo = new Array();
                fluxo.push({
                    saldoAnterior: vlSaldoAnterior,
                    fluxoCaixa: vlFluxo,
                    registros: fl
                });


                this.setState({
                    fluxo: fluxo,
                    filtro: filtro,
                    aguardar: false
                });
            }
        }
    }
    render() {
        const { state } = this;
        return (
            <div id="manterFluxoCaixa">
                <div className="load" style={{ display: (state.aguardar ? '' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                <Container fluid="true" style={{ display: (!state.aguardar ? '' : 'none') }}>
                    <Table striped bordered hover size="sm" className="mt-2">
                        <thead>
                            <tr className="bg-success text-white">
                                <th>Fluxo de caixa por categoria</th>
                                <th>Janeiro 2020</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-info text-white">
                                <th>SALDO ANTERIOR</th>
                                <th className={'font-weight-bold '}>
                                    <label className={state.fluxo[0].saldoAnterior < 0 ? '' : 'd-none'}>(</label>
                                    {
                                        new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(state.fluxo[0].saldoAnterior.toString().replace('-', ''))
                                    }
                                    <label className={state.fluxo[0].saldoAnterior < 0 ? '' : 'd-none'}>)</label>
                                </th>
                            </tr>
                            {
                                state.fluxo[0].registros.map(function (c, index) {
                                    return (
                                        <tr key={"categoria-" + index}>
                                            <td className={c.analitico ? '' : 'font-weight-bold'}>{c.id} - {c.nome}</td>
                                            <td className={(c.analitico ? '' : 'font-weight-bold') + ' ' + (c.valor < 0 ? 'text-danger' : 'text-success')}>
                                                <label className={c.valor < 0 ? '' : 'd-none'}>(</label>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(c.valor.toString().replace('-', ''))
                                                }
                                                <label className={c.valor < 0 ? '' : 'd-none'}>)</label>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                        <tfoot>
                            <tr className="bg-info text-white">
                                <th>SALDO FINAL</th>
                                <th className={'font-weight-bold '}>
                                    <label className={state.fluxo[0].fluxoCaixa < 0 ? '' : 'd-none'}>(</label>
                                    {
                                        new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(state.fluxo[0].fluxoCaixa.toString().replace('-', ''))
                                    }
                                    <label className={state.fluxo[0].fluxoCaixa < 0 ? '' : 'd-none'}>)</label>
                                </th>
                            </tr>

                        </tfoot>
                    </Table>
                </Container>
            </div>
        )
    }
}

export default FluxoCaixa;