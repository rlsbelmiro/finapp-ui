import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import { CategoriaService } from '../../service/CategoriaService';
import { FluxoCaixaService } from '../../service/FluxoCaixaService';
import { CaixaService } from '../../service/CaixaService';
import * as date from '../../utils/date.js';


class FluxoCaixa extends Component {

    
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.obterFluxo = this.obterFluxo.bind(this);

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
        this.onLoad()
    };

    async onLoad() {
        let { filtro } = this.state;
        filtro.categorias = new Array();
        var resposta = await CategoriaService.listAtivas();
        var qtdPeriodos = 3;
        var periodos = date.getPeriodosFluxoCaixa(qtdPeriodos);



        if (resposta.sucesso) {
            resposta.objeto.map(function (c, index) {
                if (c.analitico) {
                    filtro.categorias.push(c);
                }
            });
            var dataIn = periodos[0].periodoInicio.split('/');
            var dataFin = periodos[0].periodoFim.split('/');
            filtro.periodoInicio = dataIn[2] + '-' + dataIn[1] + '-' + dataIn[0];
            filtro.periodoFim = dataFin[2] + '-' + dataFin[1] + '-' + dataFin[0];
            var respFluxo = await FluxoCaixaService.getValores(filtro);
            if (respFluxo.sucesso) {
                var fl = new Array();
                var temp = respFluxo.objeto;
                for (var x = 0; x < temp.length; x++) {
                    var f = temp[x];
                    var obj = fl.filter(y => 
                        y.id === f.categoria.id
                        &&
                        Date.parse(date.formatarDataIngles(y.periodoInicio)) <= Date.parse(date.formatarDataIngles(f.dataFormatada))
                        &&
                        Date.parse(date.formatarDataIngles(y.periodoInicio)) <= Date.parse(date.formatarDataIngles(f.dataFormatada))
                    );
                    if(obj.length == 0){
                        var a = {
                            id: f.categoria.id,
                            nome: f.categoria.numeracao + ' ' + f.categoria.nome.toString().toUpperCase(),
                            analitico: f.categoria.analitico,
                            valor: f.valor,
                            categoriaSuperiorId: f.categoria.categoriaSuperiorId,
                            calculada: f.categoria.analitico,
                            data: f.data,
                            dataFormatada: f.dataFormatada,
                            periodos: new Array()
                        }
                        
                        periodos.forEach(p => {
                            var index = temp.filter(t =>
                                Date.parse(date.formatarDataIngles(p.periodoInicio)) <= Date.parse(date.formatarDataIngles(t.dataFormatada))
                                &&
                                Date.parse(date.formatarDataIngles(p.periodoInicio)) <= Date.parse(date.formatarDataIngles(t.dataFormatada))
                                &&
                                t.categoria.id == a.id
                            );
                            var total = 0;
                            //alert(index);
                            index.forEach(i => { total += i.valor});
                            a.periodos.push({
                                periodoInicio: p.periodoInicio,
                                periodoFim: p.periodoFim,
                                label: p.label,
                                valor: total
                            });
                        });
                        fl.push(a);
                    } 
                }

                console.log(JSON.stringify(fl));
                var contador = 0;
                do {
                    temp = fl.filter(x => !x.calculada);
                    for (var x = 0; x < temp.length; x++) {
                        var f = temp[x];
                        var calculadas = fl.filter(o => o.categoriaSuperiorId == f.id && o.calculada);
                        var totalCategorias = fl.filter(o => o.categoriaSuperiorId == f.id).length;
                        if (calculadas.length == totalCategorias) {
                            var total = 0;
                            calculadas.map(m => total += m.valor);
                            fl.forEach(m => {
                                if (m.id === f.id) {
                                    m.valor = total;
                                    m.calculada = true;
                                }
                            });
                            total = 0;
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
                var arraySaldoFinal = fl.filter(f => f.categoriaSuperiorId == 0);
                if (arraySaldoFinal.length > 0) {
                    arraySaldoFinal.forEach(x => {
                        vlFluxo += x.valor;
                    });
                } else {
                    fl.forEach(x => {
                        vlFluxo += x.valor;
                    })
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

    obterFluxo(p,c){
        return p.fluxo.filter(x => x.id == c.id);
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
                                {
                                    state.periodos.map(p => {
                                        return (
                                            <th>
                                                <span>{p.label}</span>
                                                <p style={{fontSize: '10px'}}>{p.periodoInicio} à {p.periodoFim}</p>
                                            </th>
                                        )
                                    })
                                }
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
                                state.fluxo[0].registros.map(function(c,index){
                                    return(
                                        <tr key={"categoria-" + index}>
                                            <td className={c.analitico ? '' : 'font-weight-bold'}>{c.nome}</td>
                                            {
                                                c.periodos.map(function(p,i){
                                                    return (
                                                        <td className={(c.analitico ? '' : 'font-weight-bold') + ' ' + (c.valor < 0 ? 'text-danger' : 'text-success')}>
                                                        <label className={p.valor < 0 ? '' : 'd-none'}>(</label>
                                                        {
                                                            new Intl.NumberFormat('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            }).format(p.valor)
                                                        }
                                                        <label className={p.valor < 0 ? '' : 'd-none'}>)</label>
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