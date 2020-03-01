import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Channel } from '../../service/EventService';
import { FaturaCartaoService } from '../../service/FaturaCartaoService';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { LancamentoService } from '../../service/LancamentoService';
import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { CarteiraService } from '../../service/CarteiraService';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class FaturaCartao extends Component {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.onLoadLancamentos = this.onLoadLancamentos.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.getLancamento = this.getLancamento.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.reload = this.reload.bind(this);
        this.iniciarPagamento = this.iniciarPagamento.bind(this);
        this.pagarFatura = this.pagarFatura.bind(this);
        this.cancelarPagamento = this.cancelarPagamento.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.atualizarFatura = this.atualizarFatura.bind(this);
        this.atualizarVencimento = this.atualizarVencimento.bind(this);
        this.cancelarAtualizacaoFatura = this.cancelarAtualizacaoFatura.bind(this);
        this.cancelarAtualizacaoVencimento = this.cancelarAtualizacaoVencimento.bind(this);
        this.confirmarAtualizacaoValorFatura = this.confirmarAtualizacaoValorFatura.bind(this);
        this.confirmarAtualizacaoVencimento = this.confirmarAtualizacaoVencimento.bind(this);
        this.onLoadLimite = this.onLoadLimite.bind(this);

        this.state = {
            show: false,
            idFatura: 0,
            lancamentos: [],
            mensagemValidacao: '',
            valorPgtoFormatado: '',
            atualizarValorFatura: false,
            atualizarVencimento: false,
            aguardarAtualizacao: false,
            limiteDisponivel: 0.0,
            pagamento: {
                pagarTotal: false,
                pagarParcial: false,
                dataPagamento: '',
                carteiraId: 0,
                valor: 0,
                carteiras: []
            },
            faturaCartaoPagamento: {
                dataPagamento: '',
                carteiraId: 0,
                valor: 0,
                faturaId: 0
            },
            faturaCartao: {
                id: 0,
                faturaPaga: false,
                cartaoDeCreditoId: 0,
                contratanteId: 0,
                valorFatura: 0,
                dataFormatada: '',
                vencimentoFormatado: '',
                cartaoDeCredito: {
                    id: 0,
                    descricao: '',
                    bandeira: null,
                    limite: 0.0,
                    diaFechamentoFatura: 0,
                    diaVencimentoFatura: 0,
                    ativo: false,
                    carteiraId: 0,
                    contratanteId: 0
                }
            }
        }
    }

    componentDidMount() {
        Channel.on('faturaCartao:view', this.onLoad);
        Channel.on('lancamento:list', this.reload);
    }

    componentWillUnmount() {
        Channel.removeListener('faturaCartao:view', this.onLoad);
        Channel.removeListener('lancamento:list', this.reload);
    }

    reload() {
        if (this.state.show) {
            this.onLoad(this.state.idFatura);
        }
    }

    async onLoad(id) {
        var resposta = await FaturaCartaoService.get(id);
        if (resposta.sucesso) {
            this.setState({
                show: true,
                idFatura: id,
                faturaCartao: resposta.objeto,
                valorPgtoFormatado: resposta.objeto.valorFatura.toString().replace('.', ','),
                vencimentoFormatado: resposta.objeto.vencimentoFormatado
            });
            this.onLoadLancamentos(id);
            this.onLoadLimite();
        }
        else {
            alert(resposta.mensagem);
        }
    }

    async onLoadLancamentos(id) {
        var resposta = await LancamentoService.getPorFatura(id);
        if (resposta.sucesso) {
            this.setState({
                lancamentos: resposta.objeto
            })
        }
        else {
            alert(resposta.mensagem);
        }
    }

    async onLoadLimite(){
        var resposta = await FaturaCartaoService.getLimite(this.state.faturaCartao.cartaoDeCreditoId);
        if(resposta.sucesso){
            this.setState({limiteDisponivel: resposta.objeto});
        }
    }

    handleClose() {
        this.setState({
            show: false,
            idFatura: 0,
            lancamentos: [],
            mensagemValidacao: '',
            valorPgtoFormatado: '',
            vencimentoFormatado: '',
            atualizarValorFatura: false,
            aguardarAtualizacao: false,
            pagamento: {
                pagarTotal: false,
                pagarParcial: false,
                carteiras: []
            },
            faturaCartaoPagamento: {
                dataPagamento: '',
                carteiraId: 0,
                valor: 0,
                faturaId: 0
            },
            faturaCartao: {
                id: 0,
                faturaPaga: false,
                cartaoDeCreditoId: 0,
                contratanteId: 0,
                valorFatura: 0,
                dataFormatada: '',
                vencimentoFormatado: '',
                cartaoDeCredito: {
                    id: 0,
                    descricao: '',
                    bandeira: null,
                    limite: 0.0,
                    diaFechamentoFatura: 0,
                    diaVencimentoFatura: 0,
                    ativo: false,
                    carteiraId: 0,
                    contratanteId: 0
                }
            }
        });
    }

    getLancamento(id) {
        Channel.emit('lancamento:edit', id);
    }

    handleRemove(id) {
        Channel.emit('lancamento:delete', id);
    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        var pgto = this.state.faturaCartaoPagamento;

        switch (name) {
            case "dataVencimento":
                pgto.dataPagamento = value;
                break;
            case "carteiraId":
                pgto.carteiraId = value;
                break;
            case "valorFatura":
            case "valorTotalFatura":
                this.state.valorPgtoFormatado = value;
                pgto.valor = parseFloat(value.replace(',', '.'));;
                break;
            case "vencimento":
                this.state.vencimentoFormatado = value;
                break;
        }
        this.setState({ faturaCartaoPagamento: pgto, mensagemValidacao: '' });
    }

    async iniciarPagamento(pagamentoParcial) {
        var pagamento = this.state.pagamento;
        var faturaPagamento = this.state.faturaCartaoPagamento;
        var resposta = await CarteiraService.listActives();
        if (resposta.sucesso) {
            pagamento.pagarTotal = !pagamentoParcial;
            pagamento.pagarParcial = pagamentoParcial;
            pagamento.carteiras = resposta.objeto;
            pagamento.carteiraId = this.state.faturaCartao.cartaoDeCredito.carteiraId;
            faturaPagamento.faturaId = this.state.idFatura;
            faturaPagamento.carteiraId = pagamento.carteiraId;
            faturaPagamento.valor = pagamentoParcial ? 0 : this.state.faturaCartao.valorFatura;
            faturaPagamento.dataPagamento = this.state.faturaCartao.vencimentoFormatado;
            this.setState({ pagamento: pagamento });
        }
    }

    async pagarFatura() {
        var faturaPagamento = this.state.faturaCartaoPagamento;
        var data = faturaPagamento.dataPagamento.split('/');
        var isValid = true;
        if (faturaPagamento.valor <= 0) {
            this.setState({ mensagemValidacao: 'Informe o valor a pagar' })
            isValid = false;
        }
        faturaPagamento.dataPagamento = data[2] + '-' + data[1] + '-' + data[0];

        if (isValid) {
            var resposta = await FaturaCartaoService.pay(faturaPagamento);
            if (resposta.sucesso) {
                alert(resposta.mensagem);
                Channel.emit('lancamento:list', true);
            } else {
                alert('erro' + resposta.mensagem);
            }
        }
    }

    cancelarPagamento() {
        var pagamento = this.state.pagamento;
        pagamento.pagarTotal = false;
        this.setState({ pagamento: pagamento });
    }

    atualizarFatura() {
        this.setState({ atualizarValorFatura: true });
    }

    atualizarVencimento(){
        this.setState({atualizarVencimento: true});
    }

    cancelarAtualizacaoFatura() {
        this.setState({ atualizarValorFatura: false });
    }

    cancelarAtualizacaoVencimento(){
        this.setState({atualizarVencimento: false});
    }

    async confirmarAtualizacaoValorFatura() {
        this.setState({ aguardarAtualizacao: true });
        var isValid = true;
        var faturaPagamento = this.state.faturaCartaoPagamento;
        if (faturaPagamento.valor <= 0) {
            alert('Informe um valor maior que zero')
            isValid = false;
        }

        if (isValid) {
            
            var resposta = await FaturaCartaoService.updateAmount(this.state.idFatura, faturaPagamento.valor);
            if (resposta.sucesso) {
                alert(resposta.mensagem);
                Channel.emit('lancamento:list', true);
            } else {
                alert('erro' + resposta.mensagem);
            }
        }
        this.setState({ aguardarAtualizacao: false, atualizarValorFatura: false });
    }

    async confirmarAtualizacaoVencimento(){
        this.setState({ aguardarAtualizacao: true });
        var isValid = true;
        
        if (this.state.vencimentoFormatado === '') {
            alert('Informe uma data valida')
            isValid = false;
        }

        if (isValid) {
            var data = this.state.vencimentoFormatado.split('/');
            var vencimento = data[2] + '-' + data[1] + '-' + data[0];
            var resposta = await FaturaCartaoService.updateDeadline(this.state.idFatura,vencimento,this.state.vencimentoFormatado)
            if (resposta.sucesso) {
                alert(resposta.mensagem);
                Channel.emit('lancamento:list', true);
            } else {
                alert('erro' + resposta.mensagem);
            }
        }
        this.setState({ aguardarAtualizacao: false, atualizarVencimento: false });
    }

    render() {
        const { state } = this;
        return (
            <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>
                        Fatura de cartão ({state.faturaCartao.id})
                        </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm={3} className="border-right">
                            <h5 className="text-success">{state.faturaCartao.cartaoDeCredito.descricao}</h5>
                            <span>{state.faturaCartao.cartaoDeCredito.bandeira}</span>
                        </Col>
                        <Col sm={4} className="border-right">
                            <OverlayTrigger overlay={<Tooltip id="tooltip-informacao">Clique para atualilzar o vencimento</Tooltip>}>
                                <h5 className="text-success" style={{ cursor: 'pointer', display: !state.atualizarVencimento ? 'block' : 'none' }} onClick={this.atualizarVencimento}>Vence em: {state.faturaCartao.vencimentoFormatado}</h5>
                            </OverlayTrigger>
                            <Row style={{ display: state.atualizarVencimento ? 'block' : 'none' }}>
                                <Col sm={12}>
                                    <ButtonGroup>
                                        <Form.Control style={{ width: '200px' }} aria-describedby="vencimento" name="vencimento" value={state.vencimentoFormatado} onChange={this.handleChange} />
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Confirmar</Tooltip>}>
                                            <Button variant="success" size="sm" onClick={this.confirmarAtualizacaoVencimento} style={{ display: state.aguardarAtualizacao ? 'none' : 'block' }}><i className="material-icons md-12">check</i></Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Cancelar</Tooltip>}>
                                            <Button variant="danger" size="sm" onClick={this.cancelarAtualizacaoVencimento} style={{ display: state.aguardarAtualizacao ? 'none' : 'block' }}><i className="material-icons md-12">cancel</i></Button>
                                        </OverlayTrigger>
                                        <Button size="sm" variant="success" style={{ display: state.aguardarAtualizacao ? 'block' : 'none' }}>Aguarde...</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                            <span>Situação: ({state.faturaCartao.faturaPaga ? 'Paga' : 'Em aberto'})</span>
                        </Col>
                        <Col sm={5} className="border-right">
                            <OverlayTrigger overlay={<Tooltip id="tooltip-informacao">Clique para atualilzar o valor da fatura</Tooltip>}>
                                <h5 className="text-success" style={{ cursor: 'pointer', display: !state.atualizarValorFatura ? 'block' : 'none' }} onClick={this.atualizarFatura}>
                                    {
                                        new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(state.faturaCartao.valorFatura)
                                    }
                                </h5>
                            </OverlayTrigger>
                            <Row style={{ display: state.atualizarValorFatura ? 'block' : 'none' }}>
                                <Col sm={12}>
                                    <ButtonGroup>
                                        <Form.Control style={{ width: '200px' }} aria-describedby="valorTotalFatura" name="valorTotalFatura" value={state.valorPgtoFormatado} onChange={this.handleChange} />
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Confirmar</Tooltip>}>
                                            <Button variant="success" size="sm" onClick={this.confirmarAtualizacaoValorFatura} style={{ display: state.aguardarAtualizacao ? 'none' : 'block' }}><i className="material-icons md-12">check</i></Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Cancelar</Tooltip>}>
                                            <Button variant="danger" size="sm" onClick={this.cancelarAtualizacaoFatura} style={{ display: state.aguardarAtualizacao ? 'none' : 'block' }}><i className="material-icons md-12">cancel</i></Button>
                                        </OverlayTrigger>
                                        <Button size="sm" variant="success" style={{ display: state.aguardarAtualizacao ? 'block' : 'none' }}>Aguarde...</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                            <span>Limite disponível:</span>
                            <span className="ml-3">
                                {
                                    new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(state.limiteDisponivel)
                                }
                            </span>
                            <br />
                            <span>Limite total:</span>
                            <span className="ml-3">
                                {
                                    new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(state.faturaCartao.cartaoDeCredito.limite)
                                }
                            </span>
                        </Col >
                    </Row>
                    <hr />
                    <Row>
                        <Col>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th style={state.faturaCartao.faturaPaga ? { display: 'none' } : {}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.lancamentos.map(lcto =>
                                            <tr key={lcto.id}>
                                                <td>{lcto.dataCompetenciaFormatada}</td>
                                                <td>{lcto.descricao + ' (' + (lcto.infoLancamento ? lcto.infoLancamento : '1 de 1') + ')'} </td>
                                                <td>
                                                    {
                                                        new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(lcto.valor)
                                                    }
                                                </td>
                                                <td style={{ display: state.faturaCartao.faturaPaga ? 'none' : 'block' }}>
                                                    <ButtonGroup>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Editar</Tooltip>}>
                                                            <Button style={{ display: (lcto.podeAlterar ? 'block' : 'none') }} variant="primary" size="sm" onClick={() => this.getLancamento(lcto.id)}><i className="material-icons md-12">edit</i></Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Excluir</Tooltip>}>
                                                            <Button style={{ display: (lcto.podeExcluir ? 'block' : 'none') }} variant="danger" size="sm" onClick={() => this.handleRemove(lcto.id)}><i className="material-icons md-12">delete</i></Button>
                                                        </OverlayTrigger>
                                                    </ButtonGroup>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Row style={{ display: state.pagamento.pagarTotal || state.pagamento.pagarParcial ? 'block' : 'none' }}>
                        <hr />
                        <label style={{ display: state.mensagemValidacao != '' ? 'block' : 'none' }} className="font-weight-bold text-danger ml-4">{state.mensagemValidacao}</label>
                        <Form>
                            <Form.Row>
                                <Col md={3}>
                                    <Form.Group controlId="dataVencimento">
                                        <Form.Label>Dt. Pagamento</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="dataVencimento">
                                                    <i className="material-icons md-18 mr-2">date_range</i>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control placeholder="__/__/____" aria-describedby="dataVencimento" name="dataVencimento" value={state.faturaCartaoPagamento.dataPagamento} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="carteiraId">
                                        <Form.Label>Escolha a conta</Form.Label>
                                        <Form.Control id="carteiraId" name="carteiraId" as="select" onChange={this.handleChange}>
                                            <option value="0">Selecione...</option>
                                            {
                                                state.pagamento.carteiras.map(cart =>
                                                    <option key={cart.id} value={cart.id} selected={state.pagamento.carteiraId == cart.id ? 'selected' : ''}>{cart.descricao}</option>
                                                )
                                            }
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="valorFatura" style={{ display: state.pagamento.pagarParcial ? 'block' : 'none' }}>
                                        <Form.Label>Valor</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="valorFatura">
                                                    <i className="material-icons md-18 mr-2">money</i>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control aria-describedby="valorFatura" name="valorFatura" value={state.valorPgtoFormatado} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col md={4}>
                                    <Button variant="success" onClick={this.pagarFatura}>Confirmar</Button>
                                    <Button variant="danger" className="ml-2" onClick={this.cancelarPagamento}>Cancelar</Button>
                                </Col>
                            </Form.Row>
                        </Form>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                    <Button variant="primary" style={{ display: state.faturaCartao.faturaPaga ? 'none' : 'block' }} onClick={() => this.iniciarPagamento(true)}>Pagar parcial</Button>
                    <Button variant="success" style={{ display: state.faturaCartao.faturaPaga ? 'none' : 'block' }} onClick={() => this.iniciarPagamento(false)}>Pagar total</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default FaturaCartao;