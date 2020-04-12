import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { CategoriaService } from '../../service/CategoriaService';
import { Channel } from '../../service/EventService';

class ModalAlertCategoria extends Component {
    static defaultProps = {
        exibirModal: false,
        debito: false,
        credito: false,
        creditoDiferenca: 0.0,
        debitoDiferenca: 0.0,
        onConfirm: (categoriaCredito, categoriaDebito) => { },
        onCancel: () => { }
    }

    constructor(props) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            show: props.exibirModal,
            categoriasDebito: [],
            categoriasCredito: [],
            categoriaDebito: 0,
            categoriaCredito: 0
        }
    }

    componentDidMount(){
        Channel.on('selectCategory',this.onLoad);
    }

    componentWillUnmount(){
        Channel.removeListener('selectCategory',this.onLoad);
    }

    handleClose() {
        this.props.onCancel();
        this.setState({ show: false });
    }

    handleShow() {
        
    }

    async onLoad() {
        var resposta = await CategoriaService.listAnaliticas('DEBITO');
        var resposta2 = await CategoriaService.listAnaliticas('CREDITO');
        let categoriasDebito = new Array();
        let categoriasCredito = new Array();
        if (resposta.sucesso) {
            categoriasDebito = resposta.objeto;
        } else {
            alert(resposta.mensagem);
        }
        if(resposta2.sucesso){
            categoriasCredito = resposta2.objeto;
        } else {
            alert(resposta2.mensagem);
        }
        this.setState({ show: true, categoriasDebito: categoriasDebito, categoriasCredito: categoriasCredito });
    }

    handleSubmit(event) {
        const { state } = this;
        this.props.onConfirm(state.categoriaCredito, state.categoriaDebito);
        this.handleClose();
    }

    handleChange(event){
        const { target } = event,
            { name, value } = target;

        
        switch(name){
            case "categoriaCreditoId":
                this.setState({categoriaCredito: value});
                break;
            case "categoriaDebitoId":
                this.setState({categoriaDebito: value});
                break;

        }

    }



    render() {
        const { props, state } = this;

        return (
            <div id="modalAlert">
                <Modal show={this.state.show} onHide={this.handleClose} size="md">
                    <Modal.Header closeButton className="bg-warning">
                        <Modal.Title>
                            <i className="material-icons text-white md-24 mr-3">warning</i>
                            <span className="h3 align-top text-white">Selecione a categoria</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <span className="spanInfo text-danger">Necessário selecionar categoria para o lançamento dos valores de diferença</span>
                        <Form.Group controlId="categoriaDebitoId" style={{display: props.debito ? '' : 'none'}}>
                            <Form.Label>Categoria débito</Form.Label>
                            <span className="spanInfo text-danger">
                                    (Valor: {
                                        new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(props.debitoDiferenca)
                                    })
                            </span>
                            <Form.Control id="categoriaDebitoId" name="categoriaDebitoId" as="select" onChange={this.handleChange}>
                                <option value="0" name="categoriaDebitoId">Selecione...</option>
                                {
                                    state.categoriasDebito.map(cart =>
                                        <option name="categoriaDebitoId" key={cart.id} value={cart.id} selected={state.categoriaRateioId == cart.id ? 'selected' : ''}>({cart.tipo === "DEBITO" ? "D" : "C"}) {cart.numeracao} - {cart.nome.toString().toUpperCase()}</option>
                                    )
                                }
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="categoriaCreditoId" style={{display: props.credito ? '' : 'none'}}>
                            <Form.Label>Categoria crédito</Form.Label>
                            <span className="spanInfo text-success">
                                    (Valor: {
                                        new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(props.creditoDiferenca)
                                    })
                            </span>
                            <Form.Control id="categoriaCreditoId" name="categoriaCreditoId" as="select" onChange={this.handleChange}>
                                <option value="0" name="categoriaCreditoId">Selecione...</option>
                                {
                                    state.categoriasCredito.map(cart =>
                                        <option name="categoriaCreditoId" key={cart.id} value={cart.id} selected={state.categoriaRateioId == cart.id ? 'selected' : ''}>({cart.tipo === "DEBITO" ? "D" : "C"}) {cart.numeracao} - {cart.nome.toString().toUpperCase()}</option>
                                    )
                                }
                            </Form.Control>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleClose}>Cancelar</Button>
                        <Button variant="success" onClick={this.handleSubmit}>Confirmar</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }


}

export default ModalAlertCategoria;