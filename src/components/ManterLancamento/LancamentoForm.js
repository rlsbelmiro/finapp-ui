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
import { Channel } from '../../service/EventService'


class LancamentoForm extends Component {
    static defaultProps = {
        lancamentoEdit: {},
        habilitarNovoLcto: true
    }

    constructor(props, context) {
        super(props, context);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCartao = this.handleCartao.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.handleParcelas = this.handleParcelas.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.reiniciarState = this.reiniciarState.bind(this);

        this.state = {
            show: props.exibirModal,
            lancamento: {
                id: 0,
                tipo: 0,
                descricao: '',
                valor: 0,
                dataCompetencia: '',
                dataCompetenciaFormatada: '',
                dataVencimento: '',
                dataVencimentoFormatada: '',
                situacao: 'PREVISTO',
                carteiraId: 0,
                cartaoDeCreditoId: 0,
                faturaCartaoId: 0,
                pessoaId: 0,
                qtdParcelas: 1,
                parcelamentoFixo: false

            },
            idLancamento: 0,
            carteiras: [],
            cartoes: [],
            aguardar: true,
            erro: false,
            sucesso: false,
            mensagem: '',
            isCartao: false,
            isParcelado: false,
            aguardarCadastro: false,
            valorEntrada: '',
            valorParcela: 0
        };
    }

    componentDidMount() {
        Channel.on('lancamento:edit', this.onLoad);
    }

    componentWillUnmount() {
        Channel.removeListener('lancamento:edit', this.onLoad);
    }

    onLoad(id) {
        this.handleShow(id);
    }

    handleClose() {
        this.reiniciarState();
        this.setState({ show: false });

    }

    async handleShow(id) {
        this.reiniciarState();
        this.setState({ idLancamento: id });
        this.setState({ show: true });
        var lancamento = this.state.lancamento;
        const respostaCarteira = await CarteiraService.listActives();

        if (id > 0) {
            const lcto = await LancamentoService.get(id);
            lancamento = lcto.objeto;
            lancamento.dataCompetencia = lancamento.dataCompetenciaFormatada;
            lancamento.dataVencimento = lancamento.dataVencimentoFormatada;
            this.setState({
                valorEntrada: lancamento.valor.toString().replace('.', ','),
                isCartao: lancamento.cartaoDeCreditoId > 0
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

        const respostaCartoes = await CartaoDeCreditoService.listActives();

        if (respostaCartoes.sucesso) {
            this.setState({
                cartoes: respostaCartoes.objeto,
                aguardar: false
            })
        }



    }

    async handleSubmit(event) {
        event.preventDefault();

        var lancamento = this.state.lancamento;

        lancamento.valor = parseFloat(this.state.valorEntrada.replace(',', '.'));
        var data1 = lancamento.dataCompetenciaFormatada.split('/');
        var data2 = lancamento.dataVencimentoFormatada.split('/');
        lancamento.dataCompetencia = data1[2] + '-' + data1[1] + '-' + data1[0] + 'T01:00:00' ;
        lancamento.dataVencimento = data2[2] + '-' + data2[1] + '-' + data2[0] + 'T01:00:00';
        this.setState({ aguardarCadastro: true });
        console.log(JSON.stringify(this.state.lancamento));

        if (lancamento.id === 0) {
            const resposta = await LancamentoService.create(this.state.lancamento);
            lancamento.id = resposta.idObjeto;
            this.setState({
                aguardarCadastro: false,
                mensagem: resposta.mensagem,
                sucesso: resposta.sucesso,
                erro: !resposta.sucesso,
                lancamento: lancamento
            });
        }
        else {
            const resposta = await LancamentoService.edit(this.state.lancamento, this.state.lancamento.id);
            this.setState({
                aguardarCadastro: false,
                mensagem: resposta.mensagem,
                sucesso: resposta.sucesso,
                erro: !resposta.sucesso,
                lancamento: lancamento
            });
        }

        Channel.emit('lancamento:list', true);


    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        var lancamento = this.state.lancamento;

        switch (name) {
            case "tipo":
                lancamento.tipo = value;
                break;
            case "pessoaId":
                lancamento.pessoaId = value;
                break;
            case "dataCompetencia":
                lancamento.dataCompetenciaFormatada = value;
                if(this.state.isCartao){
                    lancamento.dataVencimentoFormatada = value;
                }

                if(lancamento.dataCompetenciaFormatada.length == 2 || lancamento.dataCompetenciaFormatada.length == 5){
                    lancamento.dataCompetenciaFormatada += '/';
                }

                if(lancamento.dataVencimentoFormatada.length == 2 || lancamento.dataVencimentoFormatada.length == 5){
                    lancamento.dataVencimentoFormatada += '/';
                }
                
                break;
            case "dataVencimento":
                lancamento.dataVencimentoFormatada = value;
                if(lancamento.dataVencimentoFormatada.length == 2 || lancamento.dataVencimentoFormatada.length == 5){
                    lancamento.dataVencimentoFormatada += '/';
                }
                break;
            case "valor":
                this.state.valorEntrada = value;
                this.state.valorParcela = parseFloat(value.replace(',', '.'));
                break;
            case "carteiraId":
                lancamento.carteiraId = value;
                break;
            case "cartaoDeCreditoId":
                lancamento.cartaoDeCreditoId = value;
                break;
            case "descricao":
                lancamento.descricao = value;
                break;
            case "qtdParcelas":
                lancamento.qtdParcelas = value;
                if (lancamento.qtdParcelas > 0 && !lancamento.parcelamentoFixo) {
                    this.state.valorParcela = parseFloat(this.state.valorEntrada.replace(',', '.')) / lancamento.qtdParcelas;
                }
                break;
        }
        this.setState({ lancamento: lancamento })
    }

    handleCartao(event) {
        const { target } = event;
        const { lancamento } = this.state;
        lancamento.tipo = 'DEBITO';
        this.setState({ isCartao: target.checked, lancamento: lancamento });
    }

    handleParcelas(event) {
        const { target } = event;

        if (target.name === "isParcelado") {
            this.setState({ isParcelado: target.checked, parcelamentoFixo: false });
        } else if (target.name === "parcelamentoFixo") {
            const { lancamento } = this.state;
            lancamento.parcelamentoFixo = target.checked;
            this.setState({ lancamento: lancamento });
        }
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

    reiniciarState() {
        var lcto = {
            id: 0,
            tipo: 0,
            descricao: '',
            valor: 0,
            dataCompetencia: '',
            dataCompetenciaFormatada: '',
            dataVencimento: '',
            dataVencimentoFormatada: '',
            situacao: 'PREVISTO',
            carteiraId: 0,
            cartaoDeCreditoId: 0,
            faturaCartaoId: 0,
            pessoaId: 0,
            qtdParcelas: 1,
            parcelamentoFixo: false
        }
        this.setState({
            lancamento: lcto,
            idLancamento: 0,
            aguardar: false,
            erro: false,
            sucesso: false,
            mensagem: '',
            isCartao: false,
            isParcelado: false,
            aguardarCadastro: false,
            valorEntrada: '',
            valorParcela: 0
        });
    }


    render() {
        const { state } = this;
        return (
            <div>
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} sucesso={state.sucesso} exibirModal={state.excluir || state.erro || state.sucesso} onCancel={this.onCloseModal} />
                <Button variant="primary" className="mt-2" onClick={this.handleShow} style={{display: this.props.habilitarNovoLcto ? 'block' : 'none'}}>Novo Lançamento</Button>
                <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{state.lancamento.id > 0 ? 'Editar lançamento (' + state.lancamento.id + ')' : 'Novo lançamento'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                        <div id="formLancamento" style={{ display: (state.aguardar ? 'none' : 'inline') }}>

                            <Form>
                                <Form.Row>
                                    <Col>
                                        <Form.Group controlId="isCartao">
                                            <Form.Check custom label="É lançamento de cartão de crédito" name="isCartao" id="isCartao" checked={state.isCartao} onChange={this.handleCartao}></Form.Check>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Form.Row style={{ display: state.lancamento.id > 0 ? 'none' : 'block' }}>
                                    <Col>
                                        <Form.Group controlId="isParcelado">
                                            <Form.Check custom label="É lançamento parcelado" name="isParcelado" id="isParcelado" checked={state.isParcelado} onChange={this.handleParcelas}></Form.Check>
                                        </Form.Group>
                                        <Form.Group controlId="parcelamentoFixo" style={{ display: state.isParcelado ? 'block' : 'none' }}>
                                            <Form.Check custom label="É lançamento parcelado fixo" name="parcelamentoFixo" id="parcelamentoFixo" checked={state.lancamento.parcelamentoFixo} onChange={this.handleParcelas}></Form.Check>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Form.Row>
                                    <Col md={2}>
                                        <Form.Group controlId="tipo">
                                            <Form.Label>Tipo</Form.Label>
                                            <Form.Control name="tipo" id="tipo" as="select" onChange={this.handleChange}>
                                                <option value="0">Selecione...</option>
                                                <option value="DEBITO" selected={state.lancamento.tipo === "DEBITO" ? 'selected' : ''}>Débito</option>
                                                <option value="CREDITO" selected={state.lancamento.tipo === "CREDITO" ? 'selected' : ''}>Crédito</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="pessoa">
                                            <Form.Label>Favorecido</Form.Label>
                                            <Form.Control id="pessoa" placeholder="informe o fornecedor ou cliente" md="4" name="favorecido" defaultValue={state.lancamento.favorecido} onChange={this.handleChange} />
                                        </Form.Group>
                                    </Col>

                                </Form.Row>
                                <Form.Row>
                                    <Col>
                                        <Form.Group controlId="dataCompetencia">
                                            <Form.Label>{state.isCartao ? 'Dt. Compra' : 'Dt. Emissão'}</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="dataCompetencia">
                                                        <i className="material-icons md-18 mr-2">date_range</i>
                                                    </InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <Form.Control required placeholder="__/__/____" aria-describedby="dataCompetencia" name="dataCompetencia" value={state.lancamento.dataCompetenciaFormatada} onChange={this.handleChange} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col style={{display: state.isCartao ? 'none' : 'block'}}>
                                        <Form.Group controlId="dataVencimento" >
                                            <Form.Label>Dt. Vencimento</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Prepend>
                                                    <InputGroup.Text id="dataVencimento">
                                                        <i className="material-icons md-18 mr-2">date_range</i>
                                                    </InputGroup.Text>
                                                </InputGroup.Prepend>
                                                <Form.Control placeholder="__/__/____" aria-describedby="dataVencimento" name="dataVencimento" value={state.lancamento.dataVencimentoFormatada} onChange={this.handleChange} />
                                            </InputGroup>
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
                                <Form.Row>
                                    <Col md={3}>
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

                                        <Form.Group controlId="cartaoDeCreditoId" style={{ display: state.isCartao ? 'inline' : 'none' }}>
                                            <Form.Label>Cartão</Form.Label>
                                            <Form.Control id="cartaoDeCreditoId" name="cartaoDeCreditoId" as="select" onChange={this.handleChange}>
                                                <option value="0" name="cartaoDeCreditoId">Selecione...</option>
                                                {
                                                    state.cartoes.map(cart =>
                                                        <option key={cart.id} value={cart.id} selected={state.lancamento.cartaoDeCreditoId == cart.id ? 'selected' : ''}>{cart.descricao}</option>
                                                    )
                                                }
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="descricao">
                                            <Form.Label>Descrição</Form.Label>
                                            <Form.Control id="descricao" placeholder="informe uma descrição" md="4" name="descricao" value={state.lancamento.descricao} onChange={this.handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Form.Row >
                                    <Col md={3} style={{ display: state.isParcelado ? 'block' : 'none' }}>
                                        <Form.Group controlId="qtdParcelas" >
                                            <Form.Label>Parcelas</Form.Label>
                                            <Form.Control id="qtdParcelas" placeholder="Parcelas" md="4" name="qtdParcelas" value={state.lancamento.qtdParcelas} onChange={this.handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="align-bottom text-muted">
                                        <Form.Group controlId="qtdParcelasLabel" style={{ display: state.valorParcela > 0 ? 'block' : 'none' }}>
                                            <Form.Label>{state.lancamento.parcelamentoFixo ? 'Repetir: ' : 'Parcelamento:'} </Form.Label>
                                            <Form.Label>{state.lancamento.qtdParcelas}x de
                                            {
                                                    Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(state.valorParcela)
                                                }
                                            </Form.Label>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                        <Button variant="primary" style={{display: state.lancamento.id === 0 ? 'none' : 'block'}} onClick={this.reiniciarState}>Novo</Button>
                        <Button variant="success" style={{display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? 'block' : 'none'} } onClick={this.handleSubmit} disabled={state.aguardarCadastro}>{!state.aguardarCadastro ? state.lancamento.id > 0 ? 'Alterar' : 'Salvar' : 'Aguarde...'}</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }
}

export default LancamentoForm;