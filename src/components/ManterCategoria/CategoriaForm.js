import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Channel } from '../../service/EventService';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { CategoriaService } from '../../service/CategoriaService';
import ModalAlert from '../Commons/ModalAlert';

class CategoriaForm extends Component {
    static defaultProps = {
        getIdCategoria: () => {}
    }
    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.reiniciarState = this.reiniciarState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);

        this.state = {
            show: false,
            categorias: [],
            categoriaSelecionadaId: 0,
            mensagem: '',
            erro: false,
            alerta: false,
            sucesso: false,
            aguardar: false,
            categoria: {
                id: 0,
                numeracao: '',
                nome: '',
                ativo: true,
                analitico: true,
                tipo: '',
                categoriaSuperiorId: 0
            }
        }
    }

    componentDidMount() {
        Channel.on("categoria:new", this.handleShow);
    }

    componentWillUnmount() {
        Channel.removeListener("categoria:new", this.handleShow);
    }

    reiniciarState() {
        this.setState({
            mensagem: '',
            erro: false,
            alerta: false,
            sucesso: false,
            aguardar: false,
            categoria: {
                id: 0,
                numeracao: '',
                nome: '',
                ativo: true,
                analitico: true,
                tipo: '',
                categoriaSuperiorId: 0
            }
        })
    }

    async handleShow() {
        this.setState({ show: true });

        var respostaCategoriasSuperior = await CategoriaService.listNaoAnaliticas("AMBOS");
        if (respostaCategoriasSuperior.sucesso) {
            this.setState({ categorias: respostaCategoriasSuperior.objeto });
        }
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleChange(event) {
        const { target } = event,
            { name, value } = target;

        const { categoria } = this.state;

        switch (name) {
            case "tipo":
                categoria.tipo = value;
                break;
            case "numeracao":
                categoria.numeracao = value;
                break;
            case "nome":
                categoria.nome = value;
                break;
            case "categoriaSuperiorId":
                categoria.categoriaSuperiorId = value;
                var index = this.state.categorias.findIndex(c => c.id == value);
                if (index >= 0) {
                    var cat = this.state.categorias[index];
                    categoria.numeracao = cat.numeracao;
                }
                break;
        }

        this.setState({ categoria: categoria });
    }

    handleCheck(event) {
        const { target } = event;
        const { categoria } = this.state;

        if (target.name === "ativo") {
            categoria.ativo = target.checked;
        } else if (target.name === "analitica") {
            categoria.analitico = target.checked;
        }

        this.setState({ categoria: categoria });

    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({aguardar: true});
        const { state } = this;

        var resposta = await CategoriaService.create(state.categoria);
        if (resposta.sucesso) {
            var categoria = state.categoria;
            categoria.id = resposta.idObjeto;
            this.setState({
                mensagem: resposta.mensagem,
                erro: false,
                alerta: false,
                sucesso: true,
                aguardar: false,
                categoria: categoria
            })
        }

    }

    onCloseModal() {
        if(this.state.sucesso){
            this.props.getIdCategoria(this.state.categoria.id);
        }
        this.reiniciarState();
        this.setState({ show: false });
    }

    render() {
        const { state } = this;
        return (
            <div id="formCategoria">
                <ModalAlert mensagem={state.mensagem} erro={state.erro} alerta={state.alerta} sucesso={state.sucesso} exibirModal={state.erro || state.sucesso} onCancel={this.onCloseModal} />
                <Modal show={state.show} onHide={this.handleClose} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Cadastrar categoria</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Categoria Superior</Form.Label>
                                        <Form.Control as="select" name="categoriaSuperiorId" id="categoriaSuperiorId" onChange={this.handleChange}>
                                            <option value="0">Selecione...</option>
                                            {
                                                state.categorias.map(cart =>
                                                    <option key={cart.id} value={cart.id} selected={state.categoria.categoriaSuperiorId == cart.id ? 'selected' : ''}>{cart.numeracao} - {cart.nome.toString().toUpperCase()}</option>
                                                )
                                            }
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col md="3">
                                    <Form.Group>
                                        <Form.Label>Numeração</Form.Label>
                                        <Form.Control name="numeracao" id="numeracao" value={state.categoria.numeracao} onChange={this.handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md="9">
                                    <Form.Group>
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control name="nome" value={state.categoria.nome} onChange={this.handleChange} />
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col md="3">
                                    <Form.Group>
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Control as="select" name="tipo" id="tipo" onChange={this.handleChange}>
                                            <option value="0">Selecione...</option>
                                            <option value="DEBITO" selected={state.categoria.tipo === "DEBITO" ? 'selected' : ''}>Débito</option>
                                            <option value="CREDITO" selected={state.categoria.tipo === "CREDITO" ? 'selected' : ''}>Crédito</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Check custom type="switch" className="mt-4" name="ativo" id="ativo" label="Ativo" checked={state.categoria.ativo} onChange={this.handleCheck} />
                                    <Form.Check custom type="switch" name="analitica" id="analitica" label="Conta analítica" checked={state.categoria.analitico} onChange={this.handleCheck} />
                                </Col>

                            </Form.Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                        <Button variant="primary" onClick={this.reiniciarState} >Novo</Button>
                        <Button variant="success" onClick={this.handleSubmit}>{state.aguardar ? 'Aguarde...' : 'Salvar'}</Button>

                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default CategoriaForm;