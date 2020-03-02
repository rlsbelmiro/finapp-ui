import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import { CategoriaService } from '../../service/CategoriaService';
import { FluxoCaixaService } from '../../service/FluxoCaixaService';
import { CaixaService } from '../../service/CaixaService';
import * as date from '../../utils/date.js';
import { Channel } from '../../service/EventService';
import AgendaDetalhe from '../ManterAgenda/AgendaDetalhe';

class FluxoCaixaCategoria extends Component {
    static defaultProps = {
        exibir: false,
        qtd: 6,
        tipoPeriodo: 'Mês'
    }

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.carregarDetalhesLancamento = this.carregarDetalhesLancamento.bind(this);
        this.exibirEsconder = this.exibirEsconder.bind(this);

        this.state = {
            fluxo: [
                {
                    saldoAnterior: 0,
                    fluxoCaixa: 0,
                    registros: [{
                        id: 0,
                        nome: '',
                        analitico: false,
                        exibir: true,
                        valor: 0,
                        categoriaSuperiorId: 0,
                        calculada: false,
                        data: '',
                        periodos: [
                            {
                                periodo: {
                                    periodoInicio: '',
                                    periodoFim: '',
                                    label: '',
                                    valor: 0
                                }
                            }
                        ],
                    }]
                }
            ],
            periodos: [
                {
                    periodo: {
                        saldoAnterior: 0,
                        fluxoCaixa: 0,
                        periodoInicio: '',
                        periodoFim: '',
                        label: '',
                        valor: 0
                    }
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
        this.onLoad();
        Channel.on('fluxoCaixa:agrupar',this.onLoad);
    }

    componentWillUnmount(){
        Channel.removeListener('fluxoCaixa:agrupar',this.onLoad);
    }

    carregarDetalhesLancamento(categoria, periodo) {
        if (categoria.analitico) {
            var ag = {
                periodoInicio: periodo.periodoInicio,
                periodoFim: periodo.periodoFim,
                tipo: periodo.valor < 0 ? 'DEBITO' : 'CREDITO',
                valor: periodo.valor,
                categorias: [{
                    id: categoria.id
                }]
            }

            Channel.emit('agendaDetalhe:view', ag);
        } else {
            alert('Somente é possível consultar categorias analíticas');
        }
    }

    async onLoad() {
        let { filtro } = this.state;
        filtro.categorias = new Array();
        var resposta = await CategoriaService.listAtivas();
        var qtdPeriodos = this.props.qtd;
        var tipoPeriodo = this.props.tipoPeriodo;
        var periodos = new Array();
        if(this.props.dataInicial){
            var data = new Date(date.formatarDataIngles(this.props.dataInicial));
            periodos = date.getPeriodosFluxoCaixa(qtdPeriodos,tipoPeriodo,data);
        } else {
            periodos = date.getPeriodosFluxoCaixa(qtdPeriodos,tipoPeriodo);
        }



        if (resposta.sucesso) {
            resposta.objeto.map(function (c, index) {
                if (c.analitico) {
                    filtro.categorias.push(c);
                }
            });
            var dataIn = periodos[0].periodoInicio.split('/');
            var dataFin = periodos[qtdPeriodos - 1].periodoFim.split('/');
            filtro.periodoInicio = dataIn[2] + '-' + dataIn[1] + '-' + dataIn[0];
            filtro.periodoFim = dataFin[2] + '-' + dataFin[1] + '-' + dataFin[0];
            var respFluxo = await FluxoCaixaService.getValores(filtro);
            if (respFluxo.sucesso) {
                var fl = new Array();
                var temp = respFluxo.objeto;
                for (var x = 0; x < temp.length; x++) {
                    var f = temp[x];
                    var obj = fl.filter(y => y.id === f.categoria.id);
                    if (obj.length == 0) {
                        var a = {
                            id: f.categoria.id,
                            nome: f.categoria.numeracao + ' ' + f.categoria.nome.toString().toUpperCase(),
                            analitico: f.categoria.analitico,
                            exibir: true,
                            iconeEsconder: true,
                            categoriaSuperiorId: f.categoria.categoriaSuperiorId,
                            calculada: f.categoria.analitico,
                            data: f.data,
                            dataFormatada: f.dataFormatada,
                            periodos: new Array()
                        }
                        periodos.forEach(p => {
                            var index = temp.filter(t =>
                                (Date.parse(date.formatarDataIngles(p.periodoInicio)) <= Date.parse(date.formatarDataIngles(t.dataFormatada))
                                    &&
                                    Date.parse(date.formatarDataIngles(p.periodoFim)) >= Date.parse(date.formatarDataIngles(t.dataFormatada)))
                                &&
                                t.categoria.id == a.id
                            );
                            var total = 0;
                            index.forEach(i => { total += i.valor });
                            a.periodos.push({
                                periodoInicio: p.periodoInicio,
                                periodoFim: p.periodoFim,
                                label: p.label,
                                valor: total
                            });
                        });

                        fl.push(a);
                    } else {

                    }
                }


                var contador = 0;
                do {
                    temp = fl.filter(x => !x.calculada);
                    for (var x = 0; x < temp.length; x++) {
                        var f = temp[x];
                        var calculadas = fl.filter(o => o.categoriaSuperiorId == f.id && o.calculada);
                        var totalCategorias = fl.filter(o => o.categoriaSuperiorId == f.id).length;
                        if (calculadas.length == totalCategorias) {
                            for (var a = 0; a < f.periodos.length; a++) {
                                var p = f.periodos[a];
                                var total = 0;
                                calculadas.forEach(c1 => c1.periodos.filter(p1 =>
                                    (Date.parse(date.formatarDataIngles(p1.periodoInicio)) === Date.parse(date.formatarDataIngles(p.periodoInicio))
                                        &&
                                        Date.parse(date.formatarDataIngles(p1.periodoFim)) === Date.parse(date.formatarDataIngles(p.periodoFim)))
                                ).forEach(c3 => total += c3.valor));
                                f.periodos[a].valor = total;
                                temp[x].calculada = true;
                                total = 0;
                            }
                        }
                    }
                    contador++;
                } while (fl.filter(x => !x.calculada).length > 0);


                var saldoAnterior = await CaixaService.obterSaldoAteData(filtro.periodoInicio);
                var vlSaldoAnterior = 0;
                if (saldoAnterior.sucesso) {
                    vlSaldoAnterior = saldoAnterior.objeto.saldo;
                }

                var vlFluxo = vlSaldoAnterior;

                for (var x = 0; x < periodos.length; x++) {
                    if (x == 0) {
                        periodos[x].saldoAnterior = vlSaldoAnterior;
                        var categoriaPrincipal = fl[0].periodos[x].valor;
                        periodos[x].fluxoCaixa = vlSaldoAnterior + categoriaPrincipal;
                    } else {
                        periodos[x].saldoAnterior = periodos[x - 1].fluxoCaixa;
                        var categoriaPrincipal = fl[0].periodos[x].valor;
                        periodos[x].fluxoCaixa = periodos[x].saldoAnterior + categoriaPrincipal;
                    }
                }



                var fluxo = new Array();
                fluxo.push({
                    saldoAnterior: vlSaldoAnterior,
                    fluxoCaixa: vlFluxo,
                    registros: fl
                });

                this.setState({
                    fluxo: fluxo,
                    filtro: filtro,
                    periodos: periodos,
                    aguardar: false
                });
            }
        }
    }

    exibirEsconder(c){
        /*const { state } = this;

        state.fluxo[0].registros.filter(x => x.categoriaSuperiorId == c.id).forEach(f => {
            f.exibir = !f.exibir;
            if(!f.analiico){
                state.fluxo[0].registros.filter(o => o.categoriaSuperiorId == f.id).forEach(f1 => {
                    f1.exibir = f.exibir
                });
            }
        });

        state.fluxo[0].registros.filter(x => x.id == c.id).forEach(f => {
            f.iconeEsconder = !f.iconeEsconder;
        });

        this.setState({fluxo: state.fluxo});*/
    }



    render() {
        const { state, props } = this;
        return (
            <div id="manterFluxoCaixa" style={{ display: props.exibir ? '' : 'none' }}>
                <div className="load" style={{ display: (state.aguardar ? '' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                <AgendaDetalhe />
                <Container fluid="true" style={{ display: (!state.aguardar ? '' : 'none') }}>
                    <Table striped bordered hover size="sm" className="mt-2">
                        <thead>
                            <tr className="bg-success text-white">
                                <th>Fluxo de caixa por categoria</th>
                                {
                                    state.periodos.map(p => {
                                        return (
                                            <th>
                                                <span>{p.label}</span>
                                                <p style={{ fontSize: '10px' }}>{p.periodoInicio} à {p.periodoFim}</p>
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-info text-white">
                                <th>SALDO ANTERIOR</th>
                                {
                                    state.periodos.map(function (p, i) {
                                        return (
                                            <th key={"saldoAnterior-" + i} className={'font-weight-bold '}>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(p.saldoAnterior)
                                                }
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                            {
                                state.fluxo[0].registros.map(c => {
                                    return (
                                        <tr key={"categoria-"} style={{display: c.exibir ? '' : 'none'}}>
                                            <td className={c.analitico ? '' : 'font-weight-bold'} >
                                                {c.nome}
                                            </td>
                                            {
                                                c.periodos.map(p => {
                                                    return (
                                                        <td className={(c.analitico ? '' : 'font-weight-bold') + ' ' + (p.valor < 0 ? 'text-danger' : p.valor == 0 ? '' : 'text-success')}>
                                                            <label className="FluxoCaixaLabel" onClick={() => this.carregarDetalhesLancamento(c, p)} style={{ display: p.valor == 0 ? 'none' : '' }} >{
                                                                new Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(p.valor)
                                                            }</label>
                                                            <label style={{ display: p.valor != 0 ? 'none' : '' }}>--</label>
                                                        </td>
                                                    )
                                                })
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                        <tfoot>
                            <tr className="bg-info text-white">
                                <th>SALDO FINAL</th>
                                {
                                    state.periodos.map(function (p, i) {
                                        return (
                                            <th key={"saldoAnterior-" + i} className={'font-weight-bold '}>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(p.fluxoCaixa)
                                                }
                                            </th>
                                        )
                                    })
                                }
                            </tr>

                        </tfoot>
                    </Table>
                </Container>
            </div>
        )
    }
}

export default FluxoCaixaCategoria;