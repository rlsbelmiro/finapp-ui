import React, { Component } from 'react'
import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown'
import { LancamentoService } from '../../service/LancamentoService'
import ModalAlert from '../Commons/ModalAlert';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Channel } from '../../service/EventService';

import * as date from '../../utils/date';
import LancamentoForm from './LancamentoForm';
import { CaixaService } from '../../service/CaixaService';


class LancamentoList extends Component {
    static defaultProps = {
        carregarSomentePesquisa: false,
        filtro: {},
        exibirResumo: true,
        exibirCheckbox: true,
        exibirId: true,
        exibirEmissao: true,
        exibirConta: true,
        exibirFavorecido: true,
        exibirVencimento: true,
        exibirSituacao: true,
        exibirValor: true,
        exibirAcoes: true,
        exibirParcelamento: true,
        exibirDescricao: true,
        exibirFaturaCartao: true,
        exibirHeader: true

    }
    constructor(props, context) {
        super(props, context);

        this.handleRemove = this.handleRemove.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.handleCancelRemove = this.handleCancelRemove.bind(this);
        this.obterTotal = this.obterTotal.bind(this);
        this.carregarLancamentos = this.carregarLancamentos.bind(this);
        this.getLancamento = this.getLancamento.bind(this);
        this.pagarLancamento = this.pagarLancamento.bind(this);
        this.handleCancelarPagamento = this.handleCancelarPagamento.bind(this);
        this.onCancelarPagamento = this.onCancelarPagamento.bind(this);
        this.searchList = this.searchList.bind(this);
        this.visualizarFatura = this.visualizarFatura.bind(this);
        this.agruparCartao = this.agruparCartao.bind(this);
        this.navegarMes = this.navegarMes.bind(this);

        this.state = {
            lancamentos: [],
            lancamento: {},
            aguardar: true,
            excluir: false,
            idExcluir: 0,
            erro: false,
            alerta: false,
            mensagem: '',
            recarregar: false,
            cancelarPagamento: false,
            lancamentosAgrupados: [],
            mesAtual: new Date().getMonth() + 1,
            anoAtual: new Date().getFullYear(),
            collection: [],
            filtered: false,
        }
    }

    async componentDidMount() {
        if (!this.props.carregarSomentePesquisa) {
            this.carregarLancamentos(false, this.state.mesAtual, this.state.anoAtual);
        } else {
            this.searchList(this.props.filtro);
        }
        Channel.on('lancamento:list', this.carregarLancamentos);
        Channel.on('lancamento:search', this.searchList);
        Channel.on('lancamento:delete', this.handleRemove);
        Channel.on('lancamento:agrupar', this.agruparCartao);
    }

    componentWillUnmount() {
        Channel.removeListener('lancamento:list', this.carregarLancamentos);
        Channel.removeListener('lancamento:search', this.searchList);
        Channel.removeListener('lancamento:delete', this.handleRemove);
        Channel.removeListener('lancamento:agrupar', this.agruparCartao);
    }

    async searchList(filtro) {
        this.setState({ aguardar: true, filtered: true });
        var resposta = await LancamentoService.pesquisar(filtro);
        if (resposta.success) {
            this.setState({
                lancamentos: resposta.data,
                aguardar: false
            })
        } else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: resposta.message,
                lancamentos: new Array()
            })
        }

    }


    async carregarLancamentos(reload, mes, ano) {
        if (!reload) {
            this.setState({ aguardar: true });
        }

        if (!mes)
            mes = this.state.mesAtual;
        if (!ano)
            ano = this.state.anoAtual;

        const lancamentos = await LancamentoService.list(mes, ano);

        if (lancamentos.success) {
            let list = new Array();
            lancamentos.data.map(x => {
                list.push(x.id);
            })
            this.setState({
                lancamentos: lancamentos.data,
                aguardar: false,
                mesAtual: mes,
                anoAtual: ano,
                collection: list,
                filtered: false
            })
        } else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: 'Erro ao carregar os lançamentos'
            })
        }
    }

    handleRemove(id) {
        this.setState({
            excluir: true,
            idExcluir: id,
            mensagem: 'Deseja excluir o lançamento de id = ' + id + '?',
            alerta: true,
            cancelarPagamento: false
        });
    }

    handleCancelarPagamento(id) {
        this.setState({
            excluir: false,
            cancelarPagamento: true,
            idExcluir: id,
            mensagem: 'Deseja cancelar o pagamento do lançamento de Id = ' + id + '?',
            alerta: true
        });
    }

    handleCancelRemove() {
        this.setState({
            excluir: false,
            idExcluir: 0,
            erro: false,
            alerta: false,
            cancelarPagamento: false
        })
    }

    obterTotal(tipo) {
        const { state } = this;
        var total = 0;
        switch (tipo) {
            case "CREDIT":
                var lctos = state.lancamentos.filter(function (obj) { return obj.typeName == "CREDIT" });
                lctos.map(lcto => { total += lcto.value; });
                break;
            case "DEBIT":
                var lctos = state.lancamentos.filter(function (obj) { return obj.typeName == "DEBIT" });
                lctos.map(lcto => { total += lcto.value; });
                break;
            case "SALDO":
                var lctoC = state.lancamentos.filter(function (obj) { return obj.typeName == "CREDIT" });
                var lctoD = state.lancamentos.filter(function (obj) { return obj.typeName == "DEBIT" });
                var totalC = 0;
                var totalD = 0;
                lctoC.map(lcto => { totalC += lcto.value; });
                lctoD.map(lcto => { totalD += lcto.value; });
                total = totalC - totalD;

        }

        return total;
    }

    getLancamento(id) {
        Channel.emit('lancamento:edit', id);
    }

    pagarLancamento(id, faturaCartaoId) {
        if (faturaCartaoId > 0) {
            this.visualizarFatura(faturaCartaoId);
        } else {
            Channel.emit('lancamento:pay', id);
        }
    }

    visualizarFatura(id) {
        Channel.emit('faturaCartao:view', id);
    }

    async onRemove(lancamentoId) {
        const { lancamentos } = this.state,
            lancamentoIndex = lancamentos.findIndex(lcto => lcto.id === lancamentoId);

        if (lancamentoIndex === -1) {
            this.setState({ excluir: false, idExcluir: 0, erro: false })
            return;
        }

        var retorno = await LancamentoService.remove(lancamentoId);
        if (retorno.success) {
            lancamentos.splice(lancamentoIndex, 1);
            this.setState({ lancamentos: lancamentos, excluir: false, erro: false, alerta: false });
            Channel.emit('lancamento:list', true);
        } else {
            this.setState({
                excluir: false,
                idExcluir: 0,
                erro: true,
                mensagem: (retorno.mensagem ? retorno.mensagem : 'Ocorreu um erro ao tentar excluir!'),
                alerta: false
            });
        }
    }

    async onCancelarPagamento(id) {
        var retorno = await CaixaService.cancel(id);
        if (retorno.success) {
            this.setState({ excluir: false, erro: false, alerta: false, cancelarPagamento: false });
            Channel.emit('lancamento:list', true);
        } else {
            this.setState({
                excluir: false,
                idExcluir: 0,
                erro: true,
                mensagem: (retorno.message ? retorno.message : 'Ocorreu um erro ao tentar cancelar o pagamento!'),
                alerta: false,
                cancelarPagamento: false
            });
        }
    }

    async agruparCartao(checked) {
        this.setState({ aguardar: true });
        var resposta = await LancamentoService.agruparCartao(checked, this.state.lancamentos, this.state.lancamentosAgrupados);

        if (resposta.sucesso) {
            var lancamentos = resposta.objeto.listaAgrupar;
            var agrupados = resposta.objeto.itensAgrupados;
            this.setState({
                aguardar: false,
                lancamentos: lancamentos,
                lancamentosAgrupados: agrupados
            });


        }

    }

    async navegarMes(anterior) {
        let mes = this.state.mesAtual;
        let ano = this.state.anoAtual;
        if (anterior) {
            if (mes == 1) {
                mes = 12;
                ano--;
            }
            else {
                mes--;
            }
        }
        else {
            if (mes == 12) {
                mes = 1;
                ano++;
            }
            else {
                mes++;
            }
        }

        this.carregarLancamentos(false, mes, ano);
    }

    getDescricaoSituacao(x) {
        var retorno = "";
        switch (x) {
            case "Pending":
                retorno = "Previsto";
                break;
            case "Paid":
                retorno = "Liquidado";
                break;
            case "ParcialPaid":
                retorno = "Liquidado parcial";
                break;
            case "Canceled":
                retorno = "Cancelado";
                break;
        }

        return retorno;
    }

    getDescricaoTipo(x) {
        var retorno = "";
        switch (x) {
            case "CREDIT":
                retorno = "Crédito";
                break;
            case "DEBIT":
                retorno = "Débito";
                break;
        }

        return retorno;
    }


    render() {
        const { state, props } = this;
        return (
            <div id="lancamentoLista">
                <div>
                    <Row className="mt-3" style={{ display: props.exibirHeader ? '' : 'none' }}>
                        <Col md="2">
                            <LancamentoForm lancamentoEdit={state.lancamentoid} collection={state.collection} />
                        </Col>
                        <Col md="10">
                            <Row>
                                <Col md="1">
                                    <div id="atualizarLista">
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-view">Atualizar lista</Tooltip>}>
                                            <Button onClick={() => this.carregarLancamentos(false, state.mesAtual, state.anoAtual)} size="sm" className="bg-white text-success border-success"><span class="material-icons md-12">autorenew</span></Button>
                                        </OverlayTrigger>
                                    </div>
                                </Col>
                                <Col md="3">
                                    <div id="navegacaoMes" style={{ display: !state.filtered ? '' : 'none' }}>
                                        <span id="navegacaoMesAnt" class="material-icons" onClick={() => this.navegarMes(true)}>skip_previous</span>
                                        <span id="navegacaoMesTexto">{date.getDescricaoMes(state.mesAtual, state.anoAtual)}</span>
                                        <span id="navegacaoMesPos" class="material-icons" onClick={() => this.navegarMes(false)}>skip_next</span>
                                    </div>
                                </Col>
                                <Col md="8" className="text-right">
                                    <div className="resumoValores bg-success text-white border-white">
                                        <strong>Receber:</strong> {
                                            new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(this.obterTotal("CREDIT"))
                                        }
                                    </div>
                                    <div className="resumoValores bg-danger text-white border-white">
                                        <strong>Pagar:</strong> {
                                            new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(this.obterTotal("DEBIT"))
                                        }
                                    </div>
                                    <div className="resumoValores">
                                        <strong>Saldo:</strong> {
                                            new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(this.obterTotal("SALDO"))
                                        }
                                    </div>
                                </Col>
                            </Row>


                        </Col>
                    </Row>
                    <Row>
                        <Col md="12" style={{ display: (!state.aguardar ? 'none' : '') }}>
                            <div class="load"></div>
                        </Col>
                    </Row>
                    <div id="tabela-documentos" style={{ marginTop: '10px', display: (state.aguardar ? 'none' : '') }}>
                        <Row>
                            <Table striped hover size="sm">
                                <thead>
                                    <tr>
                                        <th style={{ display: props.exibirCheckbox ? '' : 'none' }}>
                                            <div className="custom-control custom-checkbox mr-sm-2">
                                                <input type="checkbox" className="custom-control-input" id="customControlAutosizing" />
                                                <label className="custom-control-label" htmlFor="customControlAutosizing"></label>
                                            </div>
                                        </th>
                                        <th style={{ display: props.exibirId ? '' : 'none' }}>Id</th>
                                        <th style={{ display: props.exibirId ? '' : 'none' }}>Tipo</th>
                                        <th style={{ display: props.exibirDescricao ? '' : 'none' }}>Descrição</th>
                                        <th style={{ display: props.exibirEmissao ? '' : 'none' }}>Emissão</th>
                                        <th style={{ display: props.exibirConta ? '' : 'none' }}>Conta\Cartão</th>
                                        <th style={{ display: props.exibirFavorecido ? '' : 'none' }}>Favorecido</th>
                                        <th style={{ display: props.exibirVencimento ? '' : 'none' }}>Vencimento</th>
                                        <th style={{ display: props.exibirSituacao ? '' : 'none' }}>Situação</th>
                                        <th style={{ display: props.exibirValor ? '' : 'none' }}>Valor</th>
                                        <th style={{ display: props.exibirParcelamento ? '' : 'none' }}>Parcelamento</th>
                                        <th style={{ display: props.exibirAcoes ? '' : 'none' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.lancamentos.map(lcto =>
                                            <tr key={lcto.id}>
                                                <td style={{ display: props.exibirCheckbox ? '' : 'none' }}>
                                                    <div className="custom-control custom-checkbox mr-sm-2">
                                                        <input type="checkbox" className="custom-control-input" id="customControlAutosizing1" />
                                                        <label className="custom-control-label" htmlFor="customControlAutosizing1"></label>
                                                    </div>
                                                </td>
                                                <td style={{ display: props.exibirId ? '' : 'none' }}>{lcto.id}</td>
                                                <td style={{ display: props.exibirId ? '' : 'none' }}>{this.getDescricaoTipo(lcto.typeName)}</td>
                                                <td style={{ display: props.exibirDescricao ? '' : 'none' }}>{lcto.description}</td>
                                                <td style={{ display: props.exibirEmissao ? '' : 'none' }}>
                                                    {
                                                        date.formatarDataBR(lcto.issueDate)
                                                    }

                                                </td>
                                                <td style={{ display: props.exibirConta ? '' : 'none' }}>{lcto.creditCardName == "" ? 'Conta: ' + lcto.walletName : 'Cartão: ' + lcto.creditCardName}</td>
                                                <td style={{ display: props.exibirFavorecido ? '' : 'none' }}></td>
                                                <td style={{ display: props.exibirVencimento ? '' : 'none' }}>
                                                    {date.formatarDataBR(lcto.dueDate)}
                                                </td>
                                                <td style={{ display: props.exibirSituacao ? '' : 'none' }}>{this.getDescricaoSituacao(lcto.stateName)}</td>
                                                <td style={{ display: props.exibirValor ? '' : 'none' }}>
                                                    {
                                                        new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(lcto.value)
                                                    }
                                                </td>
                                                <td style={{ display: props.exibirParcelamento ? '' : 'none' }}>
                                                    {lcto.info != "" ? lcto.info : '1 de 1'}
                                                </td>
                                                <td style={{ display: props.exibirAcoes ? '' : 'none' }}>
                                                    <ButtonGroup>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-view">Visualizar detalhes</Tooltip>}>
                                                            <Button style={{ display: (!lcto.canUpdate ? 'inline' : 'none') }} variant="primary" size="sm" onClick={() => this.getLancamento(lcto.id)}><i className="material-icons md-12">visibility</i></Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Editar</Tooltip>}>
                                                            <Button style={{ display: (lcto.canUpdate ? 'inline' : 'none') }} variant="primary" size="sm" onClick={() => this.getLancamento(lcto.id)}><i className="material-icons md-12">edit</i></Button>
                                                        </OverlayTrigger>

                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Pagar</Tooltip>}>
                                                            <Button style={{ display: (lcto.canPaid ? 'inline' : 'none') }} variant="success" size="sm" onClick={() => this.pagarLancamento(lcto.id, lcto.faturaCartaoId)}><i className="material-icons md-12">attach_money</i></Button>
                                                        </OverlayTrigger>

                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Fatura de cartão</Tooltip>}>
                                                            <Button style={{ display: (lcto.cartaoDeCreditoId > 0 && props.exibirFaturaCartao ? 'inline' : 'none') }} variant="secondary" size="sm" onClick={() => this.visualizarFatura(lcto.faturaCartaoId)}><i className="material-icons md-12">credit_card</i></Button>
                                                        </OverlayTrigger>

                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Cancelar</Tooltip>}>
                                                            <Button style={{ display: (lcto.canCancel ? 'inline' : 'none') }} variant="warning" size="sm" onClick={() => this.handleCancelarPagamento(lcto.id)}><i className="material-icons md-12">block</i></Button>
                                                        </OverlayTrigger>

                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Excluir</Tooltip>}>
                                                            <Button style={{ display: (lcto.canDelete ? 'inline' : 'none') }} variant="danger" size="sm" onClick={() => this.handleRemove(lcto.id)}><i className="material-icons md-12">delete</i></Button>
                                                        </OverlayTrigger>
                                                    </ButtonGroup>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </Table>
                        </Row>
                    </div>


                </div>
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} exibirModal={state.excluir || state.erro || state.alerta} onConfirm={() => this.onRemove(state.idExcluir)} onCancel={this.handleCancelRemove} />
                <ModalAlert mensagem={state.mensagem} alerta={state.alerta} exibirModal={state.cancelarPagamento} onConfirm={() => this.onCancelarPagamento(state.idExcluir)} onCancel={this.handleCancelRemove} />
            </div >
        )
    }
}

export default LancamentoList;