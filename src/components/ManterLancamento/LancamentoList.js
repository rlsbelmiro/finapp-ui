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

import {Channel} from '../../service/EventService';


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
        exibirFaturaCartao: true
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
            lancamentosAgrupados: []
        }
    }

    async componentDidMount() {
        if(!this.props.carregarSomentePesquisa){
            this.carregarLancamentos();
        } else {
            this.searchList(this.props.filtro);
        }
        Channel.on('lancamento:list',this.carregarLancamentos);
        Channel.on('lancamento:search',this.searchList);
        Channel.on('lancamento:delete',this.handleRemove);
        Channel.on('lancamento:agrupar',this.agruparCartao);
    }

    componentWillUnmount(){
        Channel.removeListener('lancamento:list',this.carregarLancamentos);
        Channel.removeListener('lancamento:search',this.searchList);
        Channel.removeListener('lancamento:delete',this.handleRemove);
        Channel.removeListener('lancamento:agrupar',this.agruparCartao);
    }

    async searchList(filtro){
        this.setState({aguardar: true});
        var resposta = await LancamentoService.pesquisar(filtro);
        if(resposta.sucesso){
            this.setState({
                lancamentos: resposta.objeto,
                aguardar: false
            })
        }else{
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: resposta.mensagem
            })
        }
        
    }


    async carregarLancamentos(reload){
        if(!reload){
            this.setState({aguardar: true});
        }
        const lancamentos = await LancamentoService.list();

        if (lancamentos) {
            this.setState({
                lancamentos: lancamentos,
                aguardar: false
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

    handleCancelarPagamento(id){
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
            case "CREDITO":
                var lctos = state.lancamentos.filter(function (obj) { return obj.tipo == "CREDITO" });
                lctos.map(lcto => { total += lcto.valor; });
                break;
            case "DEBITO":
                var lctos = state.lancamentos.filter(function (obj) { return obj.tipo == "DEBITO" });
                lctos.map(lcto => { total += lcto.valor; });
                break;
            case "SALDO":
                var lctoC = state.lancamentos.filter(function (obj) { return obj.tipo == "CREDITO" });
                var lctoD = state.lancamentos.filter(function (obj) { return obj.tipo == "DEBITO" });
                var totalC = 0;
                var totalD = 0;
                lctoC.map(lcto => { totalC += lcto.valor; });
                lctoD.map(lcto => { totalD += lcto.valor; });
                total = totalC - totalD;

        }

        return total;
    }

    getLancamento(id){
        Channel.emit('lancamento:edit',id);
    }

    pagarLancamento(id, faturaCartaoId){
        if(faturaCartaoId > 0){
            this.visualizarFatura(faturaCartaoId);
        } else {
            Channel.emit('lancamento:pay',id);
        }
    }

    visualizarFatura(id){
        Channel.emit('faturaCartao:view',id);
    }

    async onRemove(lancamentoId) {
        const { lancamentos } = this.state,
            lancamentoIndex = lancamentos.findIndex(lcto => lcto.id === lancamentoId);

        if (lancamentoIndex === -1) {
            this.setState({ excluir: false, idExcluir: 0, erro: false })
            return;
        }

        var retorno = await LancamentoService.remove(lancamentoId);
        if (retorno.sucesso) {
            lancamentos.splice(lancamentoIndex, 1);
            this.setState({ lancamentos: lancamentos, excluir: false, erro: false, alerta: false });
            Channel.emit('lancamento:list',true);
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

    async onCancelarPagamento(id){
        var retorno = await LancamentoService.cancelPay(id);
        if (retorno.sucesso) {
            this.setState({ excluir: false, erro: false, alerta: false, cancelarPagamento: false });
            Channel.emit('lancamento:list', true);
        } else {
            this.setState({
                excluir: false,
                idExcluir: 0,
                erro: true,
                mensagem: (retorno.mensagem ? retorno.mensagem : 'Ocorreu um erro ao tentar excluir!'),
                alerta: false,
                cancelarPagamento: false
            });
        }
    }

    async agruparCartao(checked){
        this.setState({aguardar: true});
        var resposta = await LancamentoService.agruparCartao(checked,this.state.lancamentos,this.state.lancamentosAgrupados);

        if(resposta.sucesso){
            var lancamentos = resposta.objeto.listaAgrupar;
            var agrupados = resposta.objeto.itensAgrupados;
            this.setState({
                aguardar: false,
                lancamentos: lancamentos,
                lancamentosAgrupados: agrupados
            });

            
        }
        
    }

    
    render() {
        const { state, props } = this;
        return (
            <div id="lancamentoLista">
                <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                <div style={{ display: (state.aguardar ? 'none' : 'block') }}>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th style={{display: props.exibirCheckbox ? '' : 'none'}}>
                                    <div className="custom-control custom-checkbox mr-sm-2">
                                        <input type="checkbox" className="custom-control-input" id="customControlAutosizing" />
                                        <label className="custom-control-label" htmlFor="customControlAutosizing"></label>
                                    </div>
                                </th>
                                <th style={{display: props.exibirId ? '' : 'none'}}>Id</th>
                                <th style={{display: props.exibirDescricao ? '' : 'none'}}>Descrição</th>
                                <th style={{display: props.exibirEmissao ? '' : 'none'}}>Emissão</th>
                                <th style={{display: props.exibirConta ? '' : 'none'}}>Conta\Cartão</th>
                                <th style={{display: props.exibirFavorecido ? '' : 'none'}}>Favorecido</th>
                                <th style={{display: props.exibirVencimento ? '' : 'none'}}>Vencimento</th>
                                <th style={{display: props.exibirSituacao ? '' : 'none'}}>Situação</th>
                                <th style={{display: props.exibirValor ? '' : 'none'}}>Valor</th>
                                <th style={{display: props.exibirParcelamento ? '' : 'none'}}>Parcelamento</th>
                                <th style={{display: props.exibirAcoes ? '' : 'none'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.lancamentos.map(lcto =>
                                    <tr className={lcto.tipo === 'CREDITO' ? 'text-success' : 'text-danger'} key={lcto.id}>
                                        <td style={{display: props.exibirCheckbox ? '' : 'none'}}>
                                            <div className="custom-control custom-checkbox mr-sm-2">
                                                <input type="checkbox" className="custom-control-input" id="customControlAutosizing1" />
                                                <label className="custom-control-label" htmlFor="customControlAutosizing1"></label>
                                            </div>
                                        </td>
                                        <td style={{display: props.exibirId ? '' : 'none'}}>{lcto.id}</td>
                                        <td style={{display: props.exibirDescricao ? '' : 'none'}}>{lcto.descricao}</td>
                                        <td style={{display: props.exibirEmissao ? '' : 'none'}}>
                                            {lcto.dataCompetenciaFormatada}
                                            
                                        </td>
                                        <td style={{display: props.exibirConta ? '' : 'none'}}>{!lcto.cartaoDeCredito.descricao ? 'Conta: ' + lcto.carteira.descricao : 'Cartão: ' + lcto.cartaoDeCredito.descricao}</td>
                                        <td style={{display: props.exibirFavorecido ? '' : 'none'}}>{lcto.pessoa.nome}</td>
                                        <td style={{display: props.exibirVencimento ? '' : 'none'}}>
                                            {lcto.dataVencimentoFormatada}
                                        </td>
                                        <td style={{display: props.exibirSituacao ? '' : 'none'}}>{lcto.situacao}</td>
                                        <td style={{display: props.exibirValor ? '' : 'none'}}>
                                            {
                                                new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(lcto.valor)
                                            }
                                        </td>
                                        <td style={{display: props.exibirParcelamento ? '' : 'none'}}>
                                            {lcto.infoLancamento ? lcto.infoLancamento : '1 de 1'}
                                        </td>
                                        <td style={{display: props.exibirAcoes ? '' : 'none'}}>
                                            <ButtonGroup>
                                                <OverlayTrigger overlay={<Tooltip id="tooltip-view">Visualizar detalhes</Tooltip>}>
                                                    <Button style={{ display: (!lcto.podeAlterar ? 'inline' : 'none') }} variant="primary" size="sm" onClick={() => this.getLancamento(lcto.id)}><i className="material-icons md-12">visibility</i></Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Editar</Tooltip>}>
                                                    <Button style={{ display: (lcto.podeAlterar ? 'inline' : 'none') }} variant="primary" size="sm" onClick={() => this.getLancamento(lcto.id)}><i className="material-icons md-12">edit</i></Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Pagar</Tooltip>}>
                                                    <Button style={{ display: (lcto.podePagar ? 'inline' : 'none') }} variant="success" size="sm" onClick={() => this.pagarLancamento(lcto.id, lcto.faturaCartaoId)}><i className="material-icons md-12">attach_money</i></Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Fatura de cartão</Tooltip>}>
                                                    <Button style={{ display: (lcto.cartaoDeCreditoId > 0 && props.exibirFaturaCartao ? 'inline' : 'none') }} variant="secondary" size="sm" onClick={() => this.visualizarFatura(lcto.faturaCartaoId)}><i className="material-icons md-12">credit_card</i></Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Cancelar</Tooltip>}>
                                                    <Button style={{ display: (lcto.podeCancelar ? 'inline' : 'none') }} variant="warning" size="sm" onClick={() => this.handleCancelarPagamento(lcto.id)}><i className="material-icons md-12">block</i></Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Excluir</Tooltip>}>
                                                    <Button style={{ display: (lcto.podeExcluir ? 'inline' : 'none') }} variant="danger" size="sm" onClick={() => this.handleRemove(lcto.id)}><i className="material-icons md-12">delete</i></Button>
                                                </OverlayTrigger>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>

                    <Row style={{display: this.props.exibirResumo ? 'block' : 'none'}}>
                        <Col md={{ span: 8, offset: 4}}>
                            <CardDeck>
                                <Card border="success" text="success" style={{ width: "200px" }}>
                                    <Card.Header>Total receitas</Card.Header>
                                    <Card.Body>
                                        <Card.Title>
                                            {
                                                new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(this.obterTotal("CREDITO"))
                                            }
                                        </Card.Title>
                                    </Card.Body>
                                </Card>
                                <Card border="danger" text="danger" style={{ width: "200px" }}>
                                    <Card.Header>Total despesas</Card.Header>
                                    <Card.Body>
                                        <Card.Title>
                                            {
                                                new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(this.obterTotal("DEBITO"))
                                            }
                                        </Card.Title>
                                    </Card.Body>
                                </Card>
                                <Card border={this.obterTotal("SALDO") >= 0 ? "primary" : "danger"} text={this.obterTotal("SALDO") >= 0 ? "primary" : "danger"} style={{ width: "200px" }}>
                                    <Card.Header>Saldo</Card.Header>
                                    <Card.Body>
                                        <Card.Title>
                                            {
                                                new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(this.obterTotal("SALDO"))
                                            }
                                        </Card.Title>
                                    </Card.Body>
                                </Card>
                            </CardDeck>
                        </Col>
                    </Row>


                </div>
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} exibirModal={state.excluir || state.erro || state.alerta} onConfirm={() => this.onRemove(state.idExcluir)} onCancel={this.handleCancelRemove} />
                <ModalAlert mensagem={state.mensagem} alerta={state.alerta} exibirModal={state.cancelarPagamento} onConfirm={() => this.onCancelarPagamento(state.idExcluir)} onCancel={this.handleCancelRemove} />
            </div>
        )
    }
}

export default LancamentoList;