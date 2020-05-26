import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import LancamentoList from './LancamentoList';
import LancamentoSearch from './LancamentoSearch';
import LancamentoForm from './LancamentoForm';
import Dropdown from 'react-bootstrap/Dropdown'
import LancamentoPay from './LancamentoPay';
import FaturaCartao from '../ManterFaturaCartao/FaturaCartao';
import { Channel } from '../../service/EventService';

class Lancamento extends Component {
    constructor(props) {
        super(props);

        this.onEdit = this.onEdit.bind(this);
        this.onNew = this.onNew.bind(this);
        this.agruparLctoCartao = this.agruparLctoCartao.bind(this);

        this.state = {
            lancamentoid: 0,
            exibirModal: false
        }

    }

    onEdit(lancamento) {
        this.setState({ lancamentoid: lancamento, exibirModal: true });
    }

    onNew() {
        this.setState({ lancamentoid: 0, exibirModal: true });
    }

    agruparLctoCartao(event) {
        Channel.emit('lancamento:agrupar', event.target.checked);
    }

    render() {
        const { state } = this;
        return (
            <div id="manterLancamento">
                <Container fluid="true">
                    <Row>
                        <Col md="12">
                            <LancamentoSearch />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <LancamentoList onEdit={this.onEdit} />
                        </Col>
                    </Row >
                </Container>
                <LancamentoPay />
                <FaturaCartao />
            </div>
        )
    }

}

export default Lancamento