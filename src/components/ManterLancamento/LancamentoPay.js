import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import { CarteiraService } from '../../service/CarteiraService'
import { CartaoDeCreditoService } from '../../service/CartaoDeCreditoService';
import { LancamentoService } from '../../service/LancamentoService';
import ModalAlert from '../Commons/ModalAlert';
import { Channel } from '../../service/EventService';

import * as date from '../../utils/date';
import * as monetario from '../../utils/monetario';
import { CaixaService } from '../../service/CaixaService'


class LancamentoPay extends Component {

    constructor(props, context) {
        super(props, context);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.onLoad = this.onLoad.bind(this);

        this.state = {
            show: props.exibirModal,
            payment: {
                date: '',
                value: 0,
                type: 0,
                walletId: 1,
                documentId: 0,
                description: "",
                id: 0
            },
            carteiras: [],
            aguardar: true,
            erro: false,
            sucesso: false,
            mensagem: '',
            aguardarCadastro: false,
            valorEntrada: ''
        };
    }

    componentDidMount() {
        Channel.on('lancamento:pay', this.onLoad);
    }

    componentWillUnmount() {
        Channel.removeListener('lancamento:pay', this.onLoad);
    }

    onLoad(id) {
        this.handleShow(id);
    }

    handleClose() {
        this.setState({ show: false });

    }

    async handleShow(id) {
        this.setState({ show: true });
        var payment = this.state.payment;
        const respostaCarteira = await CarteiraService.list();

        if (id > 0) {
            const lcto = await LancamentoService.get(id);
            let lancamento = lcto.data;

            if (lcto.success) {
                this.setState({
                    payment: {
                        date: date.removerHoraData(lancamento.dueDate, true),
                        value: lancamento.value.toString(),
                        type: lancamento.type,
                        walletId: lancamento.walletId,
                        documentId: lancamento.id,
                        description: lancamento.description,
                    },
                    valorEntrada: monetario.formatarMoeda(lancamento.value.toString())
                });

            }
        }

        if (respostaCarteira.success) {
            payment.walletId = respostaCarteira.data.length === 1 ? respostaCarteira.data[0].id : 0;
            this.setState({
                carteiras: respostaCarteira.data,
                aguardar: false,
            })
        } else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: respostaCarteira.message
            })
        }

    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({ aguardarCadastro: true });
        const { payment } = this.state;
        payment.value = monetario.parseDecimal(this.state.valorEntrada);
        var resposta = await CaixaService.payOne(payment);
        if (resposta.success) {
            Channel.emit('lancamento:list', true);
            this.handleClose();
            this.setState({
                mensagem: resposta.message,
                sucesso: true,
                aguardarCadastro: false
            });
        }
        else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: resposta.message,
                aguardarCadastro: false
            });
        }

    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        var lancamento = this.state.payment;
        let valor = this.state.valorEntrada;

        switch (name) {
            case "dataVencimento":
                lancamento.date = value;
                break;
            case "valor":
                valor = monetario.formatarMoeda(value);
                break;
            case "carteiraId":
                lancamento.walletId = value;
                break;
        }
        this.setState({ payment: lancamento, valorEntrada: valor })
    }

    onCloseModal() {
        this.setState({
            aguardar: false,
            aguardarCadastro: false,
            sucesso: false,
            erro: false,
            alerta: false,
            mensagem: ''
        });
    }


    render() {
        const { state } = this;
        return (
            <div>
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} sucesso={state.sucesso} exibirModal={state.excluir || state.erro || state.sucesso} onCancel={this.onCloseModal} />
                <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                    <Modal.Header closeButton className="bg-success text-white">
                        <Modal.Title>{(state.payment.type === 2 ? 'Pagar' : 'Receber') + ' lançamento (' + state.payment.documentId + ')'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ></div>
                        <div id="formPagamento" style={{ display: (state.aguardar ? 'none' : 'inline') }}>
                            <Form>
                                <Form.Row>
                                    <Col>
                                        <Form.Group controlId="dataVencimento">
                                            <Form.Label>Dt. Vencimento</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="dataVencimento">
                                                        <i className="material-icons md-18 mr-2">date_range</i>
                                                    </InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <Form.Control type="date" placeholder="__/__/____" aria-describedby="dataVencimento" name="dataVencimento" value={state.payment.date} onChange={this.handleChange} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="carteiraId" style={{ display: state.isCartao ? 'none' : 'inline' }}>
                                            <Form.Label>Conta</Form.Label>
                                            <Form.Control id="carteiraId" name="carteiraId" as="select" onChange={this.handleChange}>
                                                <option value="0">Selecione...</option>
                                                {
                                                    state.carteiras.map(cart =>
                                                        <option key={cart.id} value={cart.id} selected={state.payment.walletId == cart.id ? 'selected' : ''}>{cart.name}</option>
                                                    )
                                                }
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="valor">
                                            <Form.Label>Valor</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="valor"><i className="material-icons md-18 mr-2">attach_money</i></InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <Form.Control required placeholder="999,99" aria-describedby="valor" name="valor" id="valor" value={state.valorEntrada} onChange={this.handleChange} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                        <Button variant="success" onClick={this.handleSubmit} disabled={state.aguardarCadastro}>{!state.aguardarCadastro ? (state.payment.type === 2 ? 'Pagar' : 'Receber') : 'Aguarde...'}</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }
}

export default LancamentoPay;