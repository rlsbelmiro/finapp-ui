import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import { CarteiraService } from '../../service/CarteiraService'
import { CartaoDeCreditoService } from '../../service/CartaoDeCreditoService';
import { LancamentoService } from '../../service/LancamentoService';
import ModalAlert from '../Commons/ModalAlert';
import { Channel } from '../../service/EventService'
import Table from 'react-bootstrap/Table'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { CategoriaService } from '../../service/CategoriaService'
import CategoriaForm from '../ManterCategoria/CategoriaForm';


import * as date from '../../utils/date';
import * as monetario from '../../utils/monetario';


class LancamentoForm extends Component {
    static defaultProps = {
        lancamentoEdit: {},
        habilitarNovoLcto: true,
        collection: []
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
        this.carregarCategorias = this.carregarCategorias.bind(this);
        this.adicionarCategoria = this.adicionarCategoria.bind(this);
        this.excluirCategoria = this.excluirCategoria.bind(this);
        this.editarCategoria = this.editarCategoria.bind(this);
        this.obterTotal = this.obterTotal.bind(this);
        this.cadastrarCategoria = this.cadastrarCategoria.bind(this);
        this.marcarCategoriaAposCadastro = this.marcarCategoriaAposCadastro.bind(this);
        this.getIndiceAtual = this.getIndiceAtual.bind(this);
        this.proximoLancamento = this.proximoLancamento.bind(this);
        this.lancamentoAnterior = this.lancamentoAnterior.bind(this);


        this.dropDownCategorias = React.createRef();

        this.state = {
            show: props.exibirModal,
            lancamento: {
                id: 0,
                type: 0,
                description: "",
                value: 0,
                issueDate: "",
                dueDate: "",
                state: 1,
                walletId: 0,
                creditCardId: 0,
                info: "",
                installments: 1,
                fixedInstallments: false,
                documentCategories: []
            },
            idLancamento: 0,
            carteiras: [],
            cartoes: [],
            categorias: [],
            rateioCategorias: false,
            aguardar: true,
            erro: false,
            sucesso: false,
            alerta: false,
            mensagem: '',
            isCartao: false,
            isParcelado: false,
            aguardarCadastro: false,
            valorEntrada: '',
            valorParcela: 0,
            categoriaSelecionadaId: 0,
            categoriasRateio: [],
            categoriaRateioId: 0,
            valorRateioFormatado: '',
            valorRateio: 0,
            menagemRateio: '',
            ehAlteracaoRateio: false,
            indiceAtual: 1
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

    getIndiceAtual() {
        let index = 1;
        let id = this.state.idLancamento;
        let collect = this.props.collection;
        for (let x = 0; x < collect.length; x++) {
            if (collect[x] === id) {
                index = x + 1;
                break;
            }
        }
        return index;
    }

    async handleShow(id) {
        this.reiniciarState();
        this.setState({ idLancamento: id });
        this.setState({ show: true });
        var lancamento = this.state.lancamento;
        const respostaCarteira = await CarteiraService.list();

        if (id > 0) {
            const lcto = await LancamentoService.get(id);

            if (lcto.success) {
                lancamento = lcto.data;
                var categoriaSelecionada = 0;
                let index = this.getIndiceAtual();
                if (lancamento.documentCategories != null && lancamento.documentCategories.length == 1) {
                    categoriaSelecionada = lancamento.documentCategories[0].categoryId;
                    this.setState({
                        valorEntrada: monetario.formatarMoeda(lancamento.value.toString()),
                        isCartao: lancamento.cartaoDeCreditoId > 0,
                        categoriaSelecionadaId: categoriaSelecionada,
                        indiceAtual: index
                    });
                } else if (lancamento.documentCategories != null && lancamento.documentCategories.length > 1) {
                    this.setState({
                        valorEntrada: monetario.formatarMoeda(lancamento.value.toString()),
                        isCartao: lancamento.cartaoDeCreditoId > 0,
                        rateioCategorias: true,
                        categoriasRateio: lancamento.documentCategories,
                        indiceAtual: index
                    });
                }
                else {
                    lancamento.lancamentoCategorias = new Array();
                    this.setState({
                        valorEntrada: monetario.formatarMoeda(lancamento.value.toString()),
                        isCartao: lancamento.cartaoDeCreditoId > 0,
                        categoriaSelecionadaId: categoriaSelecionada,
                        lancamento: lancamento,
                        indiceAtual: index
                    });
                }

                if (!this.state.rateioCategorias)
                    this.carregarCategorias(lancamento.tipo);
                else
                    this.carregarCategorias(0);
            } else {
                this.setState({
                    aguardar: false,
                    erro: true,
                    mensagem: lcto.message
                })
            }

        }

        if (respostaCarteira.success) {
            lancamento.walletId = respostaCarteira.data.length === 1 ? respostaCarteira.data[0].id : 0;
            this.setState({
                carteiras: respostaCarteira.data,
                aguardar: false,
                lancamento: lancamento
            })
        } else {
            this.setState({
                aguardar: false,
                erro: true,
                mensagem: respostaCarteira.message
            })
        }

        const respostaCartoes = await CartaoDeCreditoService.list();

        if (respostaCartoes.success) {
            this.setState({
                cartoes: respostaCartoes.data,
                aguardar: false
            })
        }



    }

    async handleSubmit(event) {
        event.preventDefault();

        var lancamento = this.state.lancamento;

        lancamento.value = monetario.parseDecimal(this.state.valorEntrada);
        if (this.state.rateioCategorias) {
            lancamento.documentCategories = new Array();
            for (var x = 0; x < this.state.categoriasRateio.length; x++) {
                var obj = this.state.categoriasRateio[x];
                lancamento.documentCategories.push(obj);
            }
        }
        this.setState({ aguardarCadastro: true });

        if (!this.state.rateioCategorias && lancamento.documentCategories.length == 0) {
            this.setState({
                aguardarCadastro: false,
                mensagem: 'Selecione uma categoria',
                alerta: true
            });
            return;
        } else if (this.state.rateioCategorias) {
            let valorRateio = 0;
            let valorLcto = monetario.parseDecimal(this.state.valorEntrada);
            lancamento.documentCategories.forEach(x => valorRateio += x.valor);

            if (valorRateio != valorLcto) {
                this.setState({
                    aguardarCadastro: false,
                    mensagem: 'O valor de rateio de categorias deve ser igual ao valor do lançamento.',
                    alerta: true
                });
                return;
            }
        }

        if (lancamento.id === 0) {
            console.log(JSON.stringify(this.state.lancamento));
            const resposta = await LancamentoService.create(this.state.lancamento);
            lancamento.id = resposta.idObjeto;
            this.setState({
                aguardarCadastro: false,
                mensagem: resposta.message,
                sucesso: resposta.success,
                erro: !resposta.success,
                lancamento: lancamento
            });
        }
        else {
            const resposta = await LancamentoService.edit(this.state.lancamento, this.state.lancamento.id);
            this.setState({
                aguardarCadastro: false,
                mensagem: resposta.message,
                sucesso: resposta.success,
                erro: !resposta.success,
                lancamento: lancamento
            });
        }

        Channel.emit('lancamento:list', true);


    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        var lancamento = this.state.lancamento;
        var categoriaRateioId = this.state.categoriaRateioId;
        var valorRateioFormatado = this.state.valorRateioFormatado;
        var valorRateio = this.state.valorRateio;

        switch (name) {
            case "tipo":
                lancamento.type = parseInt(value);
                this.carregarCategorias(value);
                break;
            case "pessoaId":
                //lancamento.pessoaId = value;
                break;
            case "dataCompetencia":
                lancamento.issueDate = value;
                if (this.state.isCartao) {
                    lancamento.dueDate = value;
                }


                break;
            case "dataVencimento":
                lancamento.dueDate = value;

                break;
            case "valor":
                let valor = monetario.formatarMoeda(value);
                this.state.valorEntrada = valor;
                this.state.valorParcela = monetario.parseDecimal(valor);
                if (lancamento.installments > 0 && !lancamento.fixedInstallments) {
                    this.state.valorParcela = monetario.parseDecimal(valor) / lancamento.installments;
                }

                break;
            case "carteiraId":
                lancamento.walletId = value;
                break;
            case "cartaoDeCreditoId":
                lancamento.creditCardId = value;
                break;
            case "descricao":
                lancamento.description = value;
                break;
            case "qtdParcelas":
                lancamento.installments = value;
                if (lancamento.installments > 0 && !lancamento.fixedInstallments) {
                    this.state.valorParcela = monetario.parseDecimal(this.state.valorEntrada) / lancamento.installments;
                }
                break;
            case "categoriaId":
                var index = this.state.categorias.findIndex(c => c.id == value);
                if (lancamento.documentCategories != null && lancamento.documentCategories.length > 0) {
                    lancamento.documentCategories = new Array();
                }
                if (index >= 0) {
                    var categoria = this.state.categorias[index];
                    var lctoCategoria = {
                        documentId: 0,
                        categoryId: categoria.id,
                        value: monetario.parseDecimal(this.state.valorEntrada),
                        type: categoria.type
                    }
                    lancamento.documentCategories.push(lctoCategoria);
                }
                break;
            case "categoriaRateioId":
                categoriaRateioId = value;
                break;
            case "valorCategoria":
                let vl = monetario.formatarMoeda(value);
                valorRateioFormatado = monetario.formatarMoeda(vl);
                valorRateio = monetario.parseDecimal(vl);
                break;

        }
        this.setState({ lancamento: lancamento, categoriaRateioId: categoriaRateioId, valorRateioFormatado: valorRateioFormatado, valorRateio: valorRateio });
    }

    handleCartao(event) {
        const { target } = event;
        const { lancamento } = this.state;

        if (target.checked) {
            lancamento.tipo = 'DEBITO';
            this.carregarCategorias("DEBITO");
        } else {
            lancamento.tipo = "";
            this.setState({ categorias: [] });
        }
        this.setState({ isCartao: target.checked, lancamento: lancamento });

    }

    handleParcelas(event) {
        const { target } = event;

        if (target.name === "isParcelado") {
            this.setState({ isParcelado: target.checked, parcelamentoFixo: false });
        } else if (target.name === "parcelamentoFixo") {
            const { lancamento } = this.state;
            lancamento.fixedInstallments = target.checked;
            let valorParcela = monetario.parseDecimal(this.state.valorEntrada);
            if (!lancamento.parcelamentoFixo && lancamento.qtdParcelas > 1) {
                valorParcela = valorParcela / lancamento.qtdParcelas;
            }
            this.setState({ lancamento: lancamento, valorParcela: valorParcela });
        } else if (target.name === "isRateio") {
            var categorias = new Array();
            if (target.checked) {
                if (this.state.lancamento.lancamentoCategorias != null && this.state.lancamento.lancamentoCategorias.length > 0) {

                    for (var x = 0; x < this.state.lancamento.lancamentoCategorias.length; x++) {
                        var lc = this.state.lancamento.lancamentoCategorias[x];
                        categorias.push(lc);
                    }


                }
            }
            this.setState({ rateioCategorias: target.checked, categoriasRateio: categorias });
            var tipo = target.checked ? "AMBOS" : this.state.lancamento.tipo;
            this.carregarCategorias(tipo);
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
        this.setState({
            lancamento: {
                id: 0,
                type: 0,
                description: "",
                value: 0,
                issueDate: "",
                dueDate: "",
                state: 1,
                walletId: 0,
                creditCardId: 0,
                info: "",
                installments: 1,
                fixedInstallments: false,
                documentCategories: []
            },
        });
    }

    async carregarCategorias(tipo) {
        var resposta = await CategoriaService.listAnaliticas(tipo);
        if (resposta.success) {
            this.setState({ categorias: resposta.data });
        }
    }

    adicionarCategoria() {
        const { state } = this;
        var categorias = state.categoriasRateio;
        if (categorias == null) {
            categorias = new Array();
        }

        if (state.categoriaRateioId == 0) {
            this.setState({ mensagemRateio: 'Selecione uma categoria' });
            return;
        }

        if (state.valorRateio == 0) {
            this.setState({ mensagemRateio: 'Informe o valor do rateio' });
            return
        }

        var index = state.categorias.findIndex(c => c.id == state.categoriaRateioId);
        var indexAlteracao = state.categoriasRateio.findIndex(c => c.categoriaId == state.categoriaRateioId);


        var c = {
            categoriaId: state.categoriaRateioId,
            valor: state.valorRateio,
            tipo: index >= 0 ? state.categorias[index].tipo : state.lancamento.tipo,
            categoria: {
                nome: index >= 0 ? state.categorias[index].nome : ''
            }
        }

        if (indexAlteracao < 0) {
            categorias.push(c);
        } else {
            categorias[index] = c;
        }
        this.setState({ mensagemRateio: '', categoriasRateio: categorias, categoriaRateioId: 0, valorRateioFormatado: '', valorRateio: 0, ehAlteracaoRateio: false });
    }

    excluirCategoria() {
        const { state } = this;
        var categorias = state.categoriasRateio;

        var index = categorias.findIndex(c => c.categoriaId == state.categoriaRateioId);

        if (index > -1) {
            categorias.splice(index, 1);
        }

        this.setState({ categoriasRateio: categorias, categoriaRateioId: 0, valorRateioFormatado: '', valorRateio: 0, ehAlteracaoRateio: false })
    }

    editarCategoria(id) {
        const { state } = this;
        var categorias = state.categoriasRateio;

        var index = categorias.findIndex(c => c.categoriaId == id);

        if (index > -1) {
            var c = categorias[index];
            let valor = c.valor;
            this.setState({ categoriaRateioId: c.categoriaId, valorRateioFormatado: monetario.formatarMoeda(valor.toString().replace('.', '')), valorRateio: valor, ehAlteracaoRateio: true });
        }


    }

    obterTotal() {
        const { state } = this;
        var total = 0;
        let tipo = state.lancamento.tipo == "DEBITO" ? "CREDITO" : "DEBITO";

        state.categoriasRateio.forEach(c => total += c.tipo === tipo ? c.valor * -1 : c.valor);

        return total;
    }

    cadastrarCategoria() {
        Channel.emit("categoria:new", 0);
    }

    marcarCategoriaAposCadastro(id) {
        if (!this.state.rateioCategorias) {
            this.carregarCategorias(this.state.lancamento.tipo);
            this.setState({ categoriaSelecionadaId: id });
        }
        else {
            this.carregarCategorias("AMBOS");
            this.setState({ categoriaRateioId: id });
        }
    }

    proximoLancamento() {
        let atual = this.state.indiceAtual;
        let collect = this.props.collection;
        let index = atual;
        if (index < collect.length) {
            let id = collect[index];
            this.handleShow(id);
        }
    }

    lancamentoAnterior() {
        let atual = this.state.indiceAtual;
        let collect = this.props.collection;
        let index = atual - 2;
        if (index >= 0) {
            let id = collect[index];
            this.handleShow(id);
        }
    }


    render() {
        const { state, props } = this;
        return (
            <>
                <CategoriaForm getIdCategoria={this.marcarCategoriaAposCadastro} />
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} sucesso={state.sucesso} alertaComOk={state.alerta} exibirModal={state.excluir || state.erro || state.sucesso || state.alerta} onCancel={this.onCloseModal} />
                <Button className="bg-white text-success border-success" onClick={this.handleShow} style={{ display: this.props.habilitarNovoLcto ? 'block' : 'none' }}>Incluir novo</Button>
                <Modal show={this.state.show} onHide={this.handleClose} size="xl">
                    <Modal.Header closeButton className="bg-success text-white">
                        <Modal.Title>{state.lancamento.id > 0 ? 'Editar lançamento (' + state.lancamento.id + ')' : 'Novo lançamento'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ></div>
                        <div id="formLancamento" style={{ display: (state.aguardar ? 'none' : '') }}>
                            <Row>
                                <Col md={state.rateioCategorias ? '8' : '12'}>
                                    <Form>
                                        <Form.Row>
                                            <Col>
                                                <Form.Check type="switch" inline custom label="É cartão de crédito" name="isCartao" id="isCartao" checked={state.isCartao} onChange={this.handleCartao}></Form.Check>
                                                <Form.Check style={{ display: state.lancamento.id > 0 ? 'none' : '' }} type="switch" inline custom label="É parcelado" name="isParcelado" id="isParcelado" checked={state.isParcelado} onChange={this.handleParcelas}></Form.Check>
                                                <Form.Check style={{ display: state.isParcelado ? '' : 'none' }} type="switch" inline custom label="É parcelado fixo" name="parcelamentoFixo" id="parcelamentoFixo" checked={state.lancamento.fixedInstallments} onChange={this.handleParcelas}></Form.Check>
                                            </Col>
                                            <Col style={{ display: state.lancamento.id > 0 ? '' : 'none' }}>
                                                <div id="navegacaoMes">
                                                    <span id="navegacaoMesAnt" class="material-icons" onClick={this.lancamentoAnterior} style={{ display: (state.indiceAtual == 1) ? 'none' : '' }}>skip_previous</span>
                                                    <span id="navegacaoMesTexto">{state.indiceAtual} de {props.collection.length}</span>
                                                    <span id="navegacaoMesPos" class="material-icons" onClick={this.proximoLancamento} style={{ display: (state.indiceAtual == props.collection.length) ? 'none' : '' }}>skip_next</span>
                                                </div>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row className="mt-3 mb-3" style={{ display: state.lancamento.id > 0 ? 'none' : '' }}>
                                            <Col style={{ display: state.isParcelado ? '' : 'none' }}>
                                                <Form.Label>Qtd parcelas</Form.Label>
                                                <Form.Control className="w-25 ml-2 d-inline-block" id="qtdParcelas" placeholder="Parcelas" md="4" name="qtdParcelas" value={state.lancamento.installments} onChange={this.handleChange} />
                                                <Form.Label className="w-50 ml-2 text-muted" style={{ display: state.valorParcela > 0 ? 'inline-block' : 'none' }}>
                                                    {state.lancamento.fixedInstallments ? 'Repetir: ' : 'Parcelamento:'}
                                                    {state.lancamento.installments}x de
                                                        {
                                                        Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(state.valorParcela)
                                                    }
                                                </Form.Label>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row>
                                            <Col md={2}>
                                                <Form.Group controlId="tipo">
                                                    <Form.Label>Tipo</Form.Label>
                                                    <Form.Control name="tipo" id="tipo" as="select" onChange={this.handleChange}>
                                                        <option value="0">Selecione...</option>
                                                        <option value="1" selected={state.lancamento.type === 1 ? 'selected' : ''}>Crédito</option>
                                                        <option value="2" selected={state.lancamento.type === 2 ? 'selected' : ''}>Débito</option>
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
                                                        <Form.Control type="date" required placeholder="__/__/____" aria-describedby="dataCompetencia" name="dataCompetencia" value={date.removerHoraData(state.lancamento.issueDate, true)} onChange={this.handleChange} />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col style={{ display: state.isCartao ? 'none' : 'block' }}>
                                                <Form.Group controlId="dataVencimento" >
                                                    <Form.Label>Dt. Vencimento</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Prepend>
                                                            <InputGroup.Text id="dataVencimento">
                                                                <i className="material-icons md-18 mr-2">date_range</i>
                                                            </InputGroup.Text>
                                                        </InputGroup.Prepend>
                                                        <Form.Control type="date" placeholder="__/__/____" aria-describedby="dataVencimento" name="dataVencimento" value={date.removerHoraData(state.lancamento.dueDate, true)} onChange={this.handleChange} />
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
                                            <Col md={5}>
                                                <Form.Group controlId="carteiraId" style={{ display: state.isCartao ? 'none' : 'inline' }}>
                                                    <Form.Label>Conta</Form.Label>
                                                    <Form.Control id="carteiraId" name="carteiraId" as="select" onChange={this.handleChange}>
                                                        <option value="0">Selecione...</option>
                                                        {
                                                            state.carteiras.map(cart =>
                                                                <option key={cart.id} value={cart.id} selected={state.lancamento.walletId == cart.id ? 'selected' : ''}>{cart.name}</option>
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
                                                                <option key={cart.id} value={cart.id} selected={state.lancamento.creditCardId == cart.id ? 'selected' : ''}>{cart.name}</option>
                                                            )
                                                        }
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row className={state.rateioCategorias ? 'd-none' : 'mt-2'}>
                                            <Col>
                                                <Form.Group controlId="categoriaId">
                                                    <Form.Label>Categoria</Form.Label>
                                                    <Form.Check className="ml-2" type="switch" inline custom label="Aplicar rateio de categorias" name="isRateio" id="isRateio" checked={state.rateioCategorias} onChange={this.handleParcelas}></Form.Check>
                                                    <Form.Control ref={this.dropDownCategorias} id="categoriaId" name="categoriaId" as="select" onChange={this.handleChange}>
                                                        <option value="0" name="categoriaId" >Selecione...</option>
                                                        {
                                                            state.categorias.map(cart =>
                                                                <option key={cart.id} value={cart.id} selected={state.categoriaSelecionadaId == cart.id ? 'selected' : ''}>{cart.number} - {cart.name.toString().toUpperCase()}</option>
                                                            )
                                                        }
                                                    </Form.Control>
                                                    <a href="javascript:void(0)" style={{ top: '-3px' }} className="badge badge-primary" onClick={this.cadastrarCategoria}>Criar nova categoria</a>
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row>
                                            <Col>
                                                <Form.Group controlId="descricao">
                                                    <Form.Label>Descrição</Form.Label>
                                                    <Form.Control id="descricao" placeholder="informe uma descrição" md="4" name="descricao" value={state.lancamento.description} onChange={this.handleChange} />
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>
                                    </Form>
                                </Col>
                                <Col md={4} className="border-left" className={!state.rateioCategorias ? 'd-none' : ''}>
                                    <Form style={{ display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? '' : 'none' }}>
                                        <Form.Row>
                                            <Col>
                                                <Form.Group controlId="categoriaId">
                                                    <Form.Check className="ml-2" type="switch" inline custom label="Aplicar rateio de categorias" name="isRateio" id="isRateio" checked={state.rateioCategorias} onChange={this.handleParcelas}></Form.Check>
                                                    <Form.Control id="categoriaRateioId" name="categoriaRateioId" as="select" onChange={this.handleChange}>
                                                        <option value="0" name="categoriaRateioId">Selecione...</option>
                                                        {
                                                            state.categorias.map(cart =>
                                                                <option name="categoriaRateioId" key={cart.id} value={cart.id} selected={state.categoriaRateioId == cart.id ? 'selected' : ''}>({cart.type === "2" ? "D" : "C"}) {cart.number} - {cart.name.toString().toUpperCase()}</option>
                                                            )
                                                        }
                                                    </Form.Control>
                                                    <a href="javascript:void(0)" style={{ top: '-3px' }} className="badge badge-primary" onClick={this.cadastrarCategoria}>Criar nova categoria</a>
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row>
                                            <Col>
                                                <Form.Group controlId="valorCategoria">
                                                    <InputGroup>
                                                        <InputGroup.Prepend>
                                                            <InputGroup.Text id="valorCategoria"><i className="material-icons md-18 mr-2">attach_money</i></InputGroup.Text>
                                                        </InputGroup.Prepend>
                                                        <Form.Control required placeholder="999,99" aria-describedby="valorCategoria" name="valorCategoria" id="valorCategoria" value={state.valorRateioFormatado} onChange={this.handleChange} />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row style={{ display: state.mensagemRateio !== '' ? '' : 'none' }}>
                                            <Col>
                                                <span className="text-danger">{state.mensagemRateio}</span>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row>
                                            <Col>
                                                <Button style={{ display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? '' : 'none' }} variant="success" onClick={this.adicionarCategoria}>{state.ehAlteracaoRateio ? 'Alterar' : 'Adicionar'}</Button>
                                                <Button style={{ display: state.ehAlteracaoRateio ? '' : 'none' }} variant="danger" className="ml-2" onClick={this.excluirCategoria}>Excluir</Button>
                                            </Col>
                                        </Form.Row>
                                    </Form>
                                    <Table striped bordered hover size="sm" className="mt-4">
                                        <thead>
                                            <tr>
                                                <th>Categoria</th>
                                                <th>Valor</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                state.categoriasRateio.map(cart =>
                                                    <tr key={cart.categoriaid}>
                                                        <td>{cart.categoria.name}</td>
                                                        <td>
                                                            {
                                                                Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(cart.tipo !== state.lancamento.tipo ? cart.valor * -1 : cart.valor)
                                                            }
                                                        </td>
                                                        <td>
                                                            <OverlayTrigger overlay={<Tooltip id="tooltip-edit">Editar</Tooltip>}>
                                                                <Button style={{ display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? 'block' : 'none', padding: '3px', lineHeight: '1px' }} variant="primary" size="sm" onClick={() => this.editarCategoria(cart.categoriaId)}><i className="material-icons md-12">edit</i></Button>
                                                            </OverlayTrigger>
                                                        </td>
                                                    </tr>
                                                )
                                            }

                                        </tbody>
                                        <tfoot className="font-weight-bold" style={{ display: state.categoriasRateio.length > 1 ? '' : 'none' }}>
                                            <tr>
                                                <td>Total:</td>
                                                <td colSpan="2">
                                                    {
                                                        Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(this.obterTotal())
                                                    }
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </Col>
                            </Row>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                        <Button variant="primary" onClick={this.reiniciarState}>Novo</Button>
                        <Button variant="success" onClick={this.handleSubmit} disabled={state.aguardarCadastro}>{!state.aguardarCadastro ? state.lancamento.id > 0 ? 'Alterar' : 'Salvar' : 'Aguarde...'}</Button>
                    </Modal.Footer>
                </Modal>
            </>

        )
    }
}

export default LancamentoForm;