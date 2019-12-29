import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class ModalAlert extends Component {
    static defaultProps = {
        exibirModal: false,
        erro: false,
        alerta: false,
        onConfirm: () => {},
        onCancel: () => {}
    }
    
    constructor(props) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            show: props.exibirModal
        }
    }

    handleClose() {
        this.props.onCancel();
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleSubmit(event) {
        if(!this.props.erro){
            this.props.onConfirm();
        }
        this.handleClose();

        
    }

    static getDerivedStateFromProps(props, state){
        return {show:props.exibirModal};
    }

    

    render() {
        const { props } = this;

        const styleError = {display: props.erro ? 'inline' : 'none'};
        const styleWarning = {display: props.alerta ? 'inline' : 'none'};
        const styleSuccess = {display: props.sucesso ? 'inline' : 'none'};
        const clsText = props.erro ? 'text-danger' : props.alerta ? 'text-warning' : props.sucesso ? 'text-success' : '';
        return (
            <div id="modalAlert">
                <Modal show={this.state.show} onHide={this.handleClose} size="md">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i style={styleError} className="material-icons text-danger md-24 mr-3">error</i>
                            <span style={styleError} className="h3 align-top text-danger">Erro</span>


                            <i style={styleWarning} className="material-icons text-warning md-24 mr-3">warning</i>
                            <span style={styleWarning} className="h3 align-top text-warning">Alerta</span>

                            <i style={styleSuccess} className="material-icons text-success md-24 mr-3">check_circle</i>
                            <span style={styleSuccess} className="h3 align-top text-success">Sucesso</span>
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <label className={clsText}>{props.mensagem} {props.id}</label>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button style={styleWarning} variant="danger" onClick={this.handleClose}>Cancelar</Button>
                        <Button style={styleWarning} variant="success" onClick={this.handleSubmit}>Confirmar</Button>
                        <Button style={styleError} variant="danger" onClick={this.handleClose}>Ok</Button>
                        <Button style={styleSuccess} variant="success" onClick={this.handleClose}>Ok</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        )
    }


}

export default ModalAlert;