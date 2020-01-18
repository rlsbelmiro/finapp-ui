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
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

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

        this.state = {
            tipo: [],
            datas: [],
            situacao: [],
            carteiras: [],
            cartoes: [],
            show: false,
            filtroSelecionado: {
                tipo: null,
                data: null,
                situacao: null,
                carteira: {},
                cartao: {},
                periodoInicio: '',
                periodoFim: ''
            }
        }
    }

    resetState() {
        this.setState({
            filtroSelecionado: {
                tipo: null,
                data: null,
                situacao: null,
                carteira: {},
                cartao: {},
                periodoInicio: '',
                periodoFim: ''
            }
        })
    }

    componentDidMount() {
        this.onLoad();
    }

    async onLoad() {
        var resposta = await LancamentoService.getFiltros();
        this.setState({
            tipo: resposta.tipo,
            datas: resposta.datas,
            situacao: resposta.situacao,
            carteiras: resposta.carteiras,
            cartoes: resposta.cartoes
        });
        this.resetState();

    }

    handleClose() {
        var filtro = this.state.filtroSelecionado;
        filtro.periodoInicio = '';
        filtro.periodoFim = '';
        this.setState({ show: false, filtroSelecionado: filtro });

    }

    handleChange(filtro, valor) {
        var selecao = this.state.filtroSelecionado;
        var selecionarDatas = false;
        switch (filtro) {
            case "tipo":
                selecao.tipo = valor;
                break;
            case "data":
                selecao.data = valor;
                if (valor === "SELECIONARDATAS") {
                    selecionarDatas = true;
                }
                break;
            case "situacao":
                selecao.situacao = valor;
                break;
            case "carteira":
                selecao.carteira = valor;
                break;
            case "cartao":
                selecao.cartao = valor;
                break;
        }

        this.setState({ filtroSelecionado: selecao, show: selecionarDatas });
    }

    handleChangeDatas(event) {
        const { target } = event;
        var filtro = this.state.filtroSelecionado;
        switch (target.name) {
            case "dataInicio":
                filtro.periodoInicio = target.value;
                break;
            case "dataFim":
                filtro.periodoFim = target.value;
                break;
        }

        this.setState({ filtroSelecionado: filtro });
    }

    handleInformarDatas() {
        var filtro = this.state.filtroSelecionado;
        if (filtro.periodoInicio != '') {
            var s = filtro.periodoInicio.split('/');
            filtro.periodoInicio = s[2] + '-' + s[1] + '-' + s[0];
        }
        if (filtro.periodoFim != '') {
            var s = filtro.periodoFim.split('/');
            filtro.periodoFim = s[2] + '-' + s[1] + '-' + s[0];
        }

        this.setState({ filtroSelecionado: filtro, show: false })
    }

    handleSubmit() {
        console.log(JSON.stringify(this.state.filtroSelecionado));
        Channel.emit('lancamento:search', this.state.filtroSelecionado);
    }

    handleLimparForm() {
        this.resetState();
        Channel.emit('lancamento:list', false);
    }

    getDescricaoTipoData(tipo) {
        var retorno = "";
        switch (tipo) {
            case "MESPASSADO":
                retorno = "Mês Passado";
                break;
            case "ESTEMES":
                retorno = "Mês atual";
                break;
            case "ESTEANO":
                retorno = "Este ano";
                break;
            case "ANOPASSADO":
                retorno = "Ano Passado";
                break;
            case "ULTIMOS30DIAS":
                retorno = "Últimos 30 dias";
                break;
            case "SELECIONARDATAS":
                retorno = "Selecionar datas";
                break;
            case "PROXIMOMES":
                retorno = "Próximo mês";
                break;
            default:
                retorno = tipo;
                break;
        }

        return retorno;
    }

    getDescricaoSituacao(x) {
        var retorno = "";
        switch (x) {
            case "PREVISTO":
                retorno = "Previsto";
                break;
            case "LIQUIDADO":
                retorno = "Liquidado";
                break;
            case "LIQUIDADOPARCIAL":
                retorno = "Liquidado parcial";
                break;
            case "CANCELADO":
                retorno = "Cancelado";
                break;
        }

        return retorno;
    }

    getDescricaoTipo(x) {
        var retorno = "";
        switch (x) {
            case "CREDITO":
                retorno = "Crédito";
                break;
            case "DEBITO":
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
                                            <Form.Control required placeholder="__/__/____" aria-describedby="dataInicio" name="dataInicio" value={state.filtroSelecionado.periodoInicio} onChange={this.handleChangeDatas} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="dataFim">
                                        <Form.Label>Data Início</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="dataFim">
                                                    <i className="material-icons md-18 mr-2">date_range</i>
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control required placeholder="__/__/____" aria-describedby="dataFim" name="dataFim" value={state.filtroSelecionado.periodoFim} onChange={this.handleChangeDatas} />
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
                                        Tipo: {this.getDescricaoTipo(state.filtroSelecionado.tipo)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.tipo.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('tipo', x)}>{this.getDescricaoTipo(x)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('tipo', null)}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_periodo" className="mr-1" style={{display: this.props.pesquisarPorData ? '' : 'none'}}>
                                    <Dropdown.Toggle variant="success">
                                        <i className="material-icons md-18 mr-2">date_range</i>
                                        {state.filtroSelecionado.data === "SELECIONARDATAS" ? state.filtroSelecionado.periodoInicio + ' à ' + state.filtroSelecionado.periodoFim : this.getDescricaoTipoData(state.filtroSelecionado.data)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.datas.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('data', x)}>{this.getDescricaoTipoData(x)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('data', null)}>Todas</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Situação: {this.getDescricaoSituacao(state.filtroSelecionado.situacao)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.situacao.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('situacao', x)}>{this.getDescricaoSituacao(x)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('situacao', null)}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Carteira: {state.filtroSelecionado.carteira.descricao}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.carteiras.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('carteira', x)}>{x.descricao}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('carteira', {})}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="pesquisa_status" className="mr-2">
                                    <Dropdown.Toggle variant="success">
                                        Cartão: {state.filtroSelecionado.cartao.descricao}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.cartoes.map(x =>
                                                <Dropdown.Item onClick={() => this.handleChange('cartao', x)}>{x.descricao}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('cartao', {})}>Todos</Dropdown.Item>
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