import React, { Component } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Dropdown from 'react-bootstrap/Dropdown'
import { LancamentoService } from '../../service/LancamentoService';
import { Channel } from '../../service/EventService';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import * as date from '../../utils/date.js';

class LancamentoSearch extends Component {
    static defaultProps = {
        pesquisarPorData: true
    }
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLimparForm = this.handleLimparForm.bind(this);
        this.resetState = this.resetState.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChangeDatas = this.handleChangeDatas.bind(this);
        this.handleInformarDatas = this.handleInformarDatas.bind(this);
        this.getDescricaoPeriodo = this.getDescricaoPeriodo.bind(this);

        this.state = {
            types: [],
            typeOfDates: [],
            states: [],
            wallets: [],
            creditCards: [],
            categories: [],
            show: false,
            filtroSelecionado: {
                type: null,
                typeOfDate: null,
                state: null,
                wallet: {
                    id: 0,
                    name: ''
                },
                creditCard: {
                    id: 0,
                    name: ''
                },
                category: {
                    id: 0,
                    name: ''
                },
                beginDate: '',
                endDate: ''
            }
        }
    }

    resetState() {
        this.setState({
            filtroSelecionado: {
                type: null,
                typeOfDate: null,
                state: null,
                wallet: {
                    id: 0,
                    name: ''
                },
                creditCard: {
                    id: 0,
                    name: ''
                },
                category: {
                    id: 0,
                    name: ''
                },
                beginDate: '',
                endDate: ''
            }
        })
    }

    componentDidMount() {
        this.onLoad();
    }

    async onLoad() {
        var resposta = await LancamentoService.getFiltros();

        if (resposta.success) {
            var obj = resposta.data;
            this.setState({
                types: obj.types,
                typeOfDates: obj.typeOfDates,
                states: obj.states,
                wallets: obj.wallets,
                creditCards: obj.creditCards,
                categories: obj.categories
            });
        }
        this.resetState();

    }

    handleClose() {
        var filtro = this.state.filtroSelecionado;
        filtro.beginDate = '';
        filtro.endDate = '';
        this.setState({ show: false, filtroSelecionado: filtro });

    }

    handleChange(filtro, valor) {
        var selecao = this.state.filtroSelecionado;
        var selecionarDatas = false;
        switch (filtro) {
            case "tipo":
                selecao.type = valor;
                break;
            case "data":
                selecao.typeOfDate = valor;
                if (valor === "SelectedDates") {
                    selecionarDatas = true;
                }
                break;
            case "situacao":
                selecao.state = valor;
                break;
            case "carteira":
                selecao.wallet = valor;
                break;
            case "cartao":
                selecao.creditCard = valor;
                break;
            case "categoria":
                selecao.category.push({
                    id: valor.id,
                    nome: valor.nome
                })
                break;
        }

        this.setState({ filtroSelecionado: selecao, show: selecionarDatas });
    }

    handleChangeDatas(event) {
        const { target } = event;
        var filtro = this.state.filtroSelecionado;
        switch (target.name) {
            case "dataInicio":
                filtro.beginDate = target.value;
                break;
            case "dataFim":
                filtro.endDate = target.value;
                break;
        }

        this.setState({ filtroSelecionado: filtro });
    }

    handleInformarDatas() {
        var filtro = this.state.filtroSelecionado;
        this.setState({ filtroSelecionado: filtro, show: false })
    }

    handleSubmit() {
        Channel.emit('lancamento:search', this.state.filtroSelecionado);
    }

    handleLimparForm() {
        this.resetState();
        Channel.emit('lancamento:list', false);
    }

    getDescricaoTipoData(tipo) {
        var retorno = "";
        switch (tipo) {
            case "LastMonth":
                retorno = "Mês Passado";
                break;
            case "ThisMonth":
                retorno = "Mês atual";
                break;
            case "ThisYear":
                retorno = "Este ano";
                break;
            case "LastYear":
                retorno = "Ano Passado";
                break;
            case "LastThirtyDays":
                retorno = "Últimos 30 dias";
                break;
            case "SelectedDates":
                retorno = "Selecionar datas";
                break;
            case "NextMonth":
                retorno = "Próximo mês";
                break;
            default:
                retorno = tipo;
                break;
        }

        return retorno;
    }

    getDescricaoPeriodo() {
        const { state } = this;
        let retorno = date.formatarDataBR(state.filtroSelecionado.periodoInicio);
        retorno += " à ";
        retorno += date.formatarDataBR(state.filtroSelecionado.periodoFim);
        return retorno;
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
        const { state } = this;
        return (
            <Container fluid className="rounded p-2">
                <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Informar datas</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Row>
                                <Col>
                                    <Form.Group controlId="dataInicio">
                                        <Form.Label>Data Início</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="dataInicio">
                                                    <i className="material-icons md-18 mr-2">date_range</i>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control type="date" required placeholder="__/__/____" aria-describedby="dataInicio" name="dataInicio" value={state.filtroSelecionado.beginDate} onChange={this.handleChangeDatas} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="dataFim">
                                        <Form.Label>Data Fim</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="dataFim">
                                                    <i className="material-icons md-18 mr-2">date_range</i>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control type="date" required placeholder="__/__/____" aria-describedby="dataFim" name="dataFim" value={state.filtroSelecionado.endDate} onChange={this.handleChangeDatas} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                        <Button variant="success" onClick={this.handleInformarDatas} >Confirmar</Button>
                    </Modal.Footer>
                </Modal>
                <Row>
                    <Col md="1" className="text-center text-success p-2 bg-light border rounded-lg border-success ">
                        <i className="material-icons md-24 mt-2d">search</i>
                        <label className="h6 align-top mt-2">Filtrar</label>
                    </Col>
                    <Col md="11" className="text-center p-2 bg-ligth border-2 border-bottom border-success">
                        <ButtonToolbar>
                            <ButtonGroup className="mr-2" size="" >
                                <Dropdown id="pesquisa_tipo" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Tipo: {this.getDescricaoTipo(state.filtroSelecionado.type)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.types.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('tipo', x.name)}>{this.getDescricaoTipo(x.name)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('tipo', null)}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_periodo" className="mr-1" style={{ display: this.props.pesquisarPorData ? '' : 'none' }}>
                                    <Dropdown.Toggle variant="success">
                                        <i className="material-icons md-18 mr-2">date_range</i>
                                        {state.filtroSelecionado.typeOfDate === "SELECIONARDATAS" ? this.getDescricaoPeriodo() : this.getDescricaoTipoData(state.filtroSelecionado.typeOfDate)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.typeOfDates.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('data', x.name)}>{this.getDescricaoTipoData(x.name)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('data', null)}>Todas</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Situação: {this.getDescricaoSituacao(state.filtroSelecionado.state)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.states.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('situacao', x.name)}>{this.getDescricaoSituacao(x.name)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('situacao', null)}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Carteira: {state.filtroSelecionado.wallet.name}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.wallets.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('carteira', x)}>{x.name}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('carteira', {})}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-2">
                                    <Dropdown.Toggle variant="success">
                                        Cartão: {state.filtroSelecionado.creditCard.name}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.creditCards.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('cartao', x)}>{x.name}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('cartao', {})}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_categorias" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Categoria: {state.filtroSelecionado.category.name}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.categories.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('categoria', x)}>{x.name}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('categoria', {})}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Button variant="success" onClick={this.handleSubmit}>Pesquisar</Button>
                                <Button variant="danger" onClick={this.handleLimparForm}>Limpar</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default LancamentoSearch;