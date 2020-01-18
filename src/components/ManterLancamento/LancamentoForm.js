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
import CategoriaForm from '../ManterCategoria/CategoriaForm'


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
        this.carregarCategorias = this.carregarCategorias.bind(this);
        this.adicionarCategoria = this.adicionarCategoria.bind(this);
        this.excluirCategoria = this.excluirCategoria.bind(this);
        this.editarCategoria = this.editarCategoria.bind(this);
        this.obterTotal = this.obterTotal.bind(this);
        this.cadastrarCategoria = this.cadastrarCategoria.bind(this);
        this.marcarCategoriaAposCadastro = this.marcarCategoriaAposCadastro.bind(this);


        this.dropDownCategorias = React.createRef();

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
                parcelamentoFixo: false,
                lancamentoCategorias: []

            },
            idLancamento: 0,
            carteiras: [],
            cartoes: [],
            categorias: [],
            rateioCategorias: false,
            aguardar: true,
            erro: false,
            sucesso: false,
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
            valorRateio: 0
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
            var categoriaSelecionada = 0;
            if (lancamento.lancamentoCategorias != null && lancamento.lancamentoCategorias.length == 1) {
                categoriaSelecionada = lancamento.lancamentoCategorias[0].categoriaId;
                this.setState({
                    valorEntrada: lancamento.valor.toString().replace('.', ','),
                    isCartao: lancamento.cartaoDeCreditoId > 0,
                    categoriaSelecionadaId: categoriaSelecionada
                });
            } else if (lancamento.lancamentoCategorias != null && lancamento.lancamentoCategorias.length > 1) {
                this.setState({
                    valorEntrada: lancamento.valor.toString().replace('.', ','),
                    isCartao: lancamento.cartaoDeCreditoId > 0,
                    rateioCategorias: true,
                    categoriasRateio: lancamento.lancamentoCategorias
                });
            }
            else {
                lancamento.lancamentoCategorias = new Array();
                this.setState({
                    valorEntrada: lancamento.valor.toString().replace('.', ','),
                    isCartao: lancamento.cartaoDeCreditoId > 0,
                    categoriaSelecionadaId: categoriaSelecionada,
                    lancamento: lancamento
                });
            }

            if (!this.state.rateioCategorias)
                this.carregarCategorias(lancamento.tipo);
            else
                this.carregarCategorias("AMBOS");

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
        lancamento.dataCompetencia = data1[2] + '-' + data1[1] + '-' + data1[0] + 'T01:00:00';
        lancamento.dataVencimento = data2[2] + '-' + data2[1] + '-' + data2[0] + 'T01:00:00';
        if (this.state.rateioCategorias) {
            lancamento.lancamentoCategorias = new Array();
            for (var x = 0; x < this.state.categoriasRateio.length; x++) {
                var obj = this.state.categoriasRateio[x];
                lancamento.lancamentoCategorias.push(obj);
            }
        }
        this.setState({ aguardarCadastro: true });

        if(!this.state.rateioCategorias && this.state.categoriaSelecionadaId > 0){
            alert(JSON.stringify(this.state.categorias));
            var index = this.state.categorias.findIndex(c => c.id == this.state.categoriaSelecionadaId);
            //if (lancamento.lancamentoCategorias != null && lancamento.lancamentoCategorias.length > 0) {
                lancamento.lancamentoCategorias = new Array();
            //}
            if (index >= 0) {
                var categoria = this.state.categorias[index];
                var lctoCategoria = {
                    lancamentoId: 0,
                    categoriaId: categoria.id,
                    valor: parseFloat(this.state.valorEntrada.replace(',', '.')),
                    tipo: categoria.tipo
                }
                lancamento.lancamentoCategorias.push(lctoCategoria);
            }
        }

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
        var categoriaRateioId = this.state.categoriaRateioId;
        var valorRateioFormatado = this.state.valorRateioFormatado;
        var valorRateio = this.state.valorRateio;

        switch (name) {
            case "tipo":
                lancamento.tipo = value;
                this.carregarCategorias(value);
                break;
            case "pessoaId":
                lancamento.pessoaId = value;
                break;
            case "dataCompetencia":
                lancamento.dataCompetenciaFormatada = value;
                if (this.state.isCartao) {
                    lancamento.dataVencimentoFormatada = value;
                }

                if (lancamento.dataCompetenciaFormatada.length == 2 || lancamento.dataCompetenciaFormatada.length == 5) {
                    lancamento.dataCompetenciaFormatada += '/';
                }

                if (lancamento.dataVencimentoFormatada.length == 2 || lancamento.dataVencimentoFormatada.length == 5) {
                    lancamento.dataVencimentoFormatada += '/';
                }

                break;
            case "dataVencimento":
                lancamento.dataVencimentoFormatada = value;
                if (lancamento.dataVencimentoFormatada.length == 2 || lancamento.dataVencimentoFormatada.length == 5) {
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
            case "categoriaId":
                var index = this.state.categorias.findIndex(c => c.id == value);
                if (lancamento.lancamentoCategorias != null && lancamento.lancamentoCategorias.length > 0) {
                    lancamento.lancamentoCategorias = new Array();
                }
                if (index >= 0) {
                    var categoria = this.state.categorias[index];
                    var lctoCategoria = {
                        lancamentoId: 0,
                        categoriaId: categoria.id,
                        valor: parseFloat(this.state.valorEntrada.replace(',', '.')),
                        tipo: categoria.tipo
                    }
                    lancamento.lancamentoCategorias.push(lctoCategoria);
                }
                break;
            case "categoriaRateioId":
                categoriaRateioId = value;
                break;
            case "valorCategoria":
                valorRateioFormatado = value;
                valorRateio = parseFloat(value.replace(',', '.'));
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
            lancamento.parcelamentoFixo = target.checked;
            this.setState({ lancamento: lancamento });
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
            parcelamentoFixo: false,
            lancamentoCategorias: []
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
            valorParcela: 0,
            rateioCategorias: false,
            categoriaSelecionadaId: 0,
            categoriasRateio: [],
            categoriaRateioId: 0,
            valorRateioFormatado: '',
            valorRateio: 0
        });
    }

    async carregarCategorias(tipo) {
        if (tipo === "0") {
            this.setState({ categorias: new Array() });
        } else {
            var resposta = await CategoriaService.listAnaliticas(tipo);
            if (resposta.sucesso) {
                this.setState({ categorias: resposta.objeto });
            }
        }
    }

    adicionarCategoria() {
        const { state } = this;
        var categorias = state.categoriasRateio;
        if (categorias == null) {
            categorias = new Array();
        }

        var index = state.categorias.findIndex(c => c.id == state.categoriaRateioId);


        var c = {
            categoriaId: state.categoriaRateioId,
            valor: state.valorRateio,
            tipo: index >= 0 ? state.categorias[index].tipo : state.lancamento.tipo,
            categoria: {
                nome: index >= 0 ? state.categorias[index].nome : ''
            }
        }
        categorias.push(c);
        this.setState({ categoriasRateio: categorias, categoriaRateioId: 0, valorRateioFormatado: '', valorRateio: 0 });
    }

    excluirCategoria() {
        const { state } = this;
        var categorias = state.categoriasRateio;

        var index = categorias.findIndex(c => c.categoriaId == state.categoriaRateioId);

        if (index > -1) {
            categorias.splice(index, 1);
        }

        this.setState({ categoriasRateio: categorias, categoriaRateioId: 0, valorRateioFormatado: '', valorRateio: 0 })
    }

    editarCategoria(id) {
        const { state } = this;
        var categorias = state.categoriasRateio;

        var index = categorias.findIndex(c => c.categoriaId == id);

        if (index > -1) {
            var c = categorias[index];
            this.setState({ categoriaRateioId: c.categoriaId, valorRateioFormatado: c.valor.toString(), valorRateio: c.valor });
        }


    }

    obterTotal() {
        const { state } = this;
        var total = 0;

        state.categoriasRateio.forEach(c => total += c.tipo === "DEBITO" ? c.valor * -1 : c.valor);

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


    render() {
        const { state } = this;
        return (
            <div>
                <CategoriaForm getIdCategoria={this.marcarCategoriaAposCadastro} />
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} sucesso={state.sucesso} exibirModal={state.excluir || state.erro || state.sucesso} onCancel={this.onCloseModal} />
                <Button variant="success" className="mt-2" onClick={this.handleShow} style={{ display: this.props.habilitarNovoLcto ? 'block' : 'none' }}>Novo Lançamento</Button>
                <Modal show={this.state.show} onHide={this.handleClose} size="xl">
                    <Modal.Header closeButton className="bg-success text-white">
                        <Modal.Title>{state.lancamento.id > 0 ? 'Editar lançamento (' + state.lancamento.id + ')' : 'Novo lançamento'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                        <div id="formLancamento" style={{ display: (state.aguardar ? 'none' : '') }}>
                            <Row>
                                <Col md={state.rateioCategorias ? '8' : '12'}>
                                    <Form>
                                        <Form.Row>
                                            <Col>
                                                <Form.Check type="switch" inline custom label="É cartão de crédito" name="isCartao" id="isCartao" checked={state.isCartao} onChange={this.handleCartao}></Form.Check>
                                                <Form.Check style={{ display: state.lancamento.id > 0 ? 'none' : '' }} type="switch" inline custom label="É parcelado" name="isParcelado" id="isParcelado" checked={state.isParcelado} onChange={this.handleParcelas}></Form.Check>
                                                <Form.Check style={{ display: state.isParcelado ? '' : 'none' }} type="switch" inline custom label="É parcelado fixo" name="parcelamentoFixo" id="parcelamentoFixo" checked={state.lancamento.parcelamentoFixo} onChange={this.handleParcelas}></Form.Check>
                                            </Col>
                                        </Form.Row>
                                        <Form.Row className="mt-3 mb-3" style={{ display: state.lancamento.id > 0 ? 'none' : '' }}>
                                            <Col style={{ display: state.isParcelado ? '' : 'none' }}>
                                                <Form.Label>Qtd parcelas</Form.Label>
                                                <Form.Control className="w-25 ml-2 d-inline-block" id="qtdParcelas" placeholder="Parcelas" md="4" name="qtdParcelas" value={state.lancamento.qtdParcelas} onChange={this.handleChange} />
                                                <Form.Label className="w-50 ml-2 text-muted" style={{ display: state.valorParcela > 0 ? 'inline-block' : 'none' }}>
                                                    {state.lancamento.parcelamentoFixo ? 'Repetir: ' : 'Parcelamento:'}
                                                    {state.lancamento.qtdParcelas}x de
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
                                            <Col style={{ display: state.isCartao ? 'none' : 'block' }}>
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
                                            <Col md={5}>
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
                                                                <option key={cart.id} value={cart.id} selected={state.categoriaSelecionadaId == cart.id ? 'selected' : ''}>{cart.numeracao} - {cart.nome.toString().toUpperCase()}</option>
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
                                                    <Form.Control id="descricao" placeholder="informe uma descrição" md="4" name="descricao" value={state.lancamento.descricao} onChange={this.handleChange} />
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
                                                                <option name="categoriaRateioId" key={cart.id} value={cart.id} selected={state.categoriaRateioId == cart.id ? 'selected' : ''}>({cart.tipo === "DEBITO" ? "D" : "C"}) {cart.numeracao} - {cart.nome.toString().toUpperCase()}</option>
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
                                        <Form.Row>
                                            <Col>
                                                <Button style={{ display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? '' : 'none' }} variant="success" onClick={this.adicionarCategoria}>Adicionar</Button>
                                                <Button style={{ display: state.categoriaRateioId > 0 ? '' : 'none' }} variant="danger" className="ml-2" onClick={this.excluirCategoria}>Excluir</Button>
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
                                                        <td>{cart.categoria.nome}</td>
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
                        <Button variant="primary" style={{ display: state.lancamento.id === 0 ? 'none' : 'block' }} onClick={this.reiniciarState}>Novo</Button>
                        <Button variant="success" style={{ display: state.lancamento.id === 0 || state.lancamento.podeAlterar ? 'block' : 'none' }} onClick={this.handleSubmit} disabled={state.aguardarCadastro}>{!state.aguardarCadastro ? state.lancamento.id > 0 ? 'Alterar' : 'Salvar' : 'Aguarde...'}</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }
}

export default LancamentoForm;