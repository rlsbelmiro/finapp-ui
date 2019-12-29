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

    agruparLctoCartao(event){
        Channel.emit('lancamento:agrupar',event.target.checked);
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
                        <Col md={2}>
                            <LancamentoForm lancamentoEdit={state.lancamentoid} />
                        </Col>
                        <Col md={10}>
                            <div className="custom-control custom-checkbox mr-sm-2 mt-3">
                                <input type="checkbox" className="custom-control-input" id="customControlAutosizing" onChange={this.agruparLctoCartao} />
                                <label className="custom-control-label" htmlFor="customControlAutosizing">Agrupar lançamentos de cartão</label>
                            </div>
                        </Col>
                    </Row>
                    <Row className="border pt-4 mt-3">
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