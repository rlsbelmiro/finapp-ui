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
            lancamento: {
                id: 0,
                tipo: 0,
                descricao: '',
                valor: 0,
                dataCompetencia: '',
                dataVencimento: '',
                situacao: 'LIQUIDADO',
                carteiraId: 0,
                cartaoDeCreditoId: 0,
                faturaCartaoId: 0,
                pessoaId: 0,
                qtdParcelas: 1,
                parcelamentoFixo: false
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
        var lancamento = this.state.lancamento;
        const respostaCarteira = await CarteiraService.listActives();

        if (id > 0) {
            const lcto = await LancamentoService.get(id);
            lancamento = lcto.objeto;
            lancamento.dataVencimento = date.formatarDataIngles(lancamento.dataVencimentoFormatada);
            this.setState({
                valorEntrada: lancamento.valor.toString().replace('.', ','),
            })
        }

        if (respostaCarteira.sucesso) {
            lancamento.carteiraId = respostaCarteira.objeto.length === 1 ? respostaCarteira.objeto[0].id : 0;
            this.setState({
                carteiras: respostaCarteira.objeto,
                aguardar: false,
                lancamento: lancamento
            })
        } else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: respostaCarteira.mensagem
            })
        }

    }

    async handleSubmit(event) {
        event.preventDefault();

        var lancamento = this.state.lancamento;

        lancamento.valor = parseFloat(this.state.valorEntrada.replace(',', '.'));
        lancamento.dataVencimentoFormatada = date.formatarDataBR(lancamento.dataVencimento);
        lancamento.dataVencimento = lancamento.dataVencimento + 'T01:00:00';
        alert(JSON.stringify(lancamento));
        this.setState({ aguardarCadastro: true });
        const resposta = await LancamentoService.pay(this.state.lancamento);
            this.setState({
                aguardarCadastro: false,
                mensagem: resposta.mensagem,
                sucesso: resposta.sucesso,
                erro: !resposta.sucesso
            });
        Channel.emit('lancamento:list', true);
        this.handleClose();
    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        var lancamento = this.state.lancamento;

        switch (name) {
            case "dataVencimento":
                lancamento.dataVencimento = value;
                break;
            case "valor":
                this.state.valorEntrada = value;
                break;
            case "carteiraId":
                lancamento.carteiraId = value;
                break;
        }
        this.setState({ lancamento: lancamento })
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
                        <Modal.Title>{ (state.lancamento.tipo === 'DEBITO' ? 'Pagar' : 'Receber' ) + ' lançamento (' + state.lancamento.id + ')'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
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
                                                <Form.Control type="date" placeholder="__/__/____" aria-describedby="dataVencimento" name="dataVencimento" value={state.lancamento.dataVencimento} onChange={this.handleChange} />
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
                                                        <option key={cart.id} value={cart.id} selected={state.lancamento.carteiraId == cart.id ? 'selected' : ''}>{cart.descricao}</option>
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
                        <Button variant="success" onClick={this.handleSubmit} disabled={state.aguardarCadastro}>{!state.aguardarCadastro ?  (state.lancamento.tipo === 'DEBITO' ? 'Pagar' : 'Receber' ) : 'Aguarde...'}</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }
}

export default LancamentoPay;