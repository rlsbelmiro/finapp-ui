import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import * as date from '../../utils/date.js';
import { FluxoCaixaService } from '../../service/FluxoCaixaService.js';
import { CaixaService } from '../../service/CaixaService.js';
import { Channel } from '../../service/EventService';
import AgendaDetalhe from '../ManterAgenda/AgendaDetalhe';

class FluxoCaixaCarteira extends Component {
    static defaultProps = {
        exibir: false,
        qtd: 6,
        tipoPeriodo: 'Mês'
    }

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.obterPeriodosPorTipo = this.obterPeriodosPorTipo.bind(this);
        this.carregarDetalhesLancamento = this.carregarDetalhesLancamento.bind(this);

        this.state = {
            fluxo: {
                registros: [
                    {
                        id: 0,
                        nome: '',
                        lancamentos: [{
                            tipo: '',
                            calculada: false,
                            periodos: [
                                {
                                    periodo: {
                                        periodoInicio: '',
                                        periodoFim: '',
                                        label: '',
                                        valor: 0
                                    }
                                }
                            ]
                        }]

                    }
                ]
            },
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
                periodoFim: ''
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

    carregarDetalhesLancamento(categoria,periodo) {

        var ag = {
            periodoInicio: periodo.periodoInicio,
            periodoFim: periodo.periodoFim,
            tipo: periodo.valor < 0 ? 'DEBITO' : 'CREDITO',
            valor: periodo.valor
        }

        Channel.emit('agendaDetalhe:view', ag);
    }

    async onLoad() {
        const { state } = this;
        let { filtro } = this.state;
        var fl = {
            registros: []
        }
        var qtdPeriodos = this.props.qtd;
        var tipoPeriodo = this.props.tipoPeriodo;
        var periodos = new Array();
        if(this.props.dataInicial){
            var data = new Date(date.formatarDataIngles(this.props.dataInicial));
            periodos = date.getPeriodosFluxoCaixa(qtdPeriodos,tipoPeriodo,data);
        } else {
            periodos = date.getPeriodosFluxoCaixa(qtdPeriodos,tipoPeriodo);
        }
        var dataIn = periodos[0].periodoInicio.split('/');
        var dataFin = periodos[qtdPeriodos - 1].periodoFim.split('/');
        filtro.periodoInicio = dataIn[2] + '-' + dataIn[1] + '-' + dataIn[0];
        filtro.periodoFim = dataFin[2] + '-' + dataFin[1] + '-' + dataFin[0];
        var resposta = await FluxoCaixaService.getValoresCarteira(filtro);

        if (resposta.sucesso) {
            var temp = resposta.objeto;
            for (var x = 0; x < temp.length; x++) {
                var f = temp[x];
                var obj = fl.registros.filter(y => y.id === f.carteira.id);
                if (obj.length == 0) {
                    var a = {
                        id: f.carteira.id,
                        nome: f.carteira.descricao.toString().toUpperCase(),
                        lancamentos: new Array()
                    }

                    //inserir lançamentos creditos
                    a.lancamentos.push({
                        tipo: 'CREDITO',
                        calculada: true,
                        periodos: this.obterPeriodosPorTipo(periodos, temp, "CREDITO", a.id)
                    });

                    //inserir lançamentos debitos
                    a.lancamentos.push({
                        tipo: 'DEBITO',
                        calculada: true,
                        periodos: this.obterPeriodosPorTipo(periodos, temp, "DEBITO", a.id)
                    });


                    fl.registros.push(a);
                }
            }

            var saldoAnterior = await CaixaService.obterSaldoAteData(filtro.periodoInicio);
            var vlSaldoAnterior = 0;
            if (saldoAnterior.sucesso) {
                vlSaldoAnterior = saldoAnterior.objeto.saldo;
            }

            var vlFluxo = vlSaldoAnterior;

            for (var x = 0; x < periodos.length; x++) {
                if (x == 0) {
                    periodos[x].saldoAnterior = vlSaldoAnterior;
                    var categoriaPrincipal = 0;
                    fl.registros.forEach(r => {
                        r.lancamentos.forEach(l => {
                            l.periodos.filter(o => 
                                    Date.parse(date.formatarDataIngles(o.periodoInicio)) <= Date.parse(date.formatarDataIngles(periodos[x].periodoInicio))
                                    &&
                                    Date.parse(date.formatarDataIngles(o.periodoFim)) >= Date.parse(date.formatarDataIngles(periodos[x].periodoFim)))
                                    .forEach(p => {
                                        categoriaPrincipal += p.valor
                                    })
                        })
                    });
                    periodos[x].fluxoCaixa = vlSaldoAnterior + categoriaPrincipal;
                } else {
                    periodos[x].saldoAnterior = periodos[x - 1].fluxoCaixa;
                    var categoriaPrincipal = 0;
                    fl.registros.forEach(r => {
                        r.lancamentos.forEach(l => {
                            l.periodos.filter(o => 
                                    Date.parse(date.formatarDataIngles(o.periodoInicio)) <= Date.parse(date.formatarDataIngles(periodos[x].periodoInicio))
                                    &&
                                    Date.parse(date.formatarDataIngles(o.periodoFim)) >= Date.parse(date.formatarDataIngles(periodos[x].periodoFim)))
                                    .forEach(p => {
                                        categoriaPrincipal += p.valor
                                    })
                        })
                    });
                    periodos[x].fluxoCaixa = periodos[x].saldoAnterior + categoriaPrincipal;
                }
            }

            this.setState({
                aguardar: false,
                fluxo: fl,
                periodos: periodos,
                filtro: filtro
            });

        }
    }

    obterPeriodosPorTipo(periodos, temp, tipo, id) {
        var pe = new Array();
        periodos.forEach(p => {
            var index = temp.filter(t =>
                (Date.parse(date.formatarDataIngles(p.periodoInicio)) <= Date.parse(date.formatarDataIngles(t.dataFormatada))
                    &&
                    Date.parse(date.formatarDataIngles(p.periodoFim)) >= Date.parse(date.formatarDataIngles(t.dataFormatada)))
                &&
                t.carteira.id == id
                &&
                t.tipo == tipo
            );
            var total = 0;
            index.forEach(i => { total += i.valor });
            pe.push({
                periodoInicio: p.periodoInicio,
                periodoFim: p.periodoFim,
                label: p.label,
                valor: total
            });
        });
        return pe;
    }

    render() {
        const { props, state } = this;

        return (
            <div id="fluxoPorCarteira" style={{ display: props.exibir ? '' : 'none' }}>
                <div className="load" style={{ display: (state.aguardar ? '' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                <Container fluid="true" style={{ display: (!state.aguardar ? '' : 'none') }}>
                    <Table bordered hover size="sm" className="mt-2">
                        <thead>
                            <tr className="bg-success text-white">
                                <th className="w-25">Carteira</th>
                                {
                                    state.periodos.map(function (p, i) {
                                        return (
                                            <th key={i}>
                                                <span>{p.label}</span>
                                                <p style={{ fontSize: '10px' }}>{p.periodoInicio} à {p.periodoFim}</p>
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.fluxo.registros.map(c => {
                                    return (
                                        c.lancamentos.map((l,i) => {
                                            return (
                                                <>
                                                    <tr key={"carateira-" + i} style={{display: i == 0 ? '' : 'none'}} className="bg-info text-white">
                                                        <td>{c.nome}</td>
                                                        {
                                                            l.periodos.map(function (p, i) {
                                                                return (
                                                                    <td>
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                    <tr style={{display: i == 0 ? '' : 'none'}}>
                                                        <th>SALDO ANTERIOR</th>
                                                        {
                                                            state.periodos.map((p,iP) => {
                                                                return (
                                                                    <td key={"periodoI-" + iP} >
                                                                        <label>{
                                                                            new Intl.NumberFormat('pt-BR', {
                                                                                style: 'currency',
                                                                                currency: 'BRL'
                                                                            }).format(p.saldoAnterior)
                                                                        }</label>
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                    <tr key={"carteiraP-"} className={l.tipo === "DEBITO" ? 'text-danger' : 'text-success'}>
                                                        <td>{l.tipo === "DEBITO" ? "SAÍDAS" : "ENTRADAS"}</td>
                                                        {
                                                            l.periodos.map(p => {
                                                                return (
                                                                    <td key={"periodoT-"}>
                                                                        <label className="FluxoCaixaLabel" onClick={() => this.carregarDetalhesLancamento(c,p)} style={{ display: p.valor == 0 ? 'none' : '' }} >{
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
                                                    <tr style={{display: i == 0 ? 'none' : ''}}>
                                                        <th>SALDO FINAL</th>
                                                        {
                                                            state.periodos.map(function (p, iPeriodo) {
                                                                return (
                                                                    <td key={"periodoS-" + iPeriodo}>
                                                                        <label style={{ display: p.fluxoCaixa == 0 ? 'none' : '' }} >{
                                                                            new Intl.NumberFormat('pt-BR', {
                                                                                style: 'currency',
                                                                                currency: 'BRL'
                                                                            }).format(p.fluxoCaixa)
                                                                        }</label>
                                                                        <label style={{ display: p.fluxoCaixa != 0 ? 'none' : '' }}>--</label>
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                </>
                                            )
                                        })
                                    )
                                })
                            }
                        </tbody>
                        <tfoot>

                        </tfoot>
                    </Table>
                </Container>
            </div>
        )
    }
}

export default FluxoCaixaCarteira;