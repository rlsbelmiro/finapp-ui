import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Saldo from './Saldo';
import MenuConteudo from './MenuConteudo';
import Routes from './Routes';
import { isLogged } from '../Commons/Auth';

class ConteudoFinannceiro extends Component {

    constructor(props) {
        super(props);

        this.exibirEsconderMenu = this.exibirEsconderMenu.bind(this);

        this.state = {
            colunasMenu: 2,
            colunasConteudo: 10,
            menuRetraido: false,
            clsIcone: 'material-icons md-18 mr-2'
        }
    }

    exibirEsconderMenu() {
        const { state } = this;
        if (state.colunasMenu == 2) {
            this.setState({ colunasMenu: 1, colunasConteudo: 11, menuRetraido: true, clsIcone: 'material-icons md-36 mr-2', clsNav: 'mr-auto flex-column mt-2 text-center' });
        } else {
            this.setState({ colunasMenu: 2, colunasConteudo: 10, menuRetraido: false, clsIcone: 'material-icons md-18 mr-2', clsNav: 'mr-auto flex-column mt-2' });
        }
    }

    render() {
        const { state } = this;
        return (
            <Container fluid="true" >
                <Row>
                    <Col style={{ height: "100%" }} md="12" className="pl-0 pr-0 bg-light pb-4">
                        <Routes />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default ConteudoFinannceiro;