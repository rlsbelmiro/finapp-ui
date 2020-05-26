import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Saldo from './Saldo';
import MenuConteudo from './MenuConteudo';
import Routes from './Routes';
import { Channel } from '../../service/EventService';
import { isLogged } from '../Commons/Auth';

class ConteudoFinannceiro extends Component {

    constructor(props) {
        super(props);

        this.validarAcessos = this.validarAcessos.bind(this);
        this.state = {
            colunasMenu: 0,
            colunasConteudo: 12,
            menuRetraido: false,
            clsIcone: 'material-icons md-18 mr-2',
            usuarioLogado: isLogged()
        }
    }

    componentDidMount() {
        Channel.on('login', this.validarAcessos);
        this.validarAcessos();
    }

    componentWillUnmount() {
        Channel.removeListener('login', this.validarAcessos);
    }

    validarAcessos() {
        let logado = isLogged();
        this.setState({ usuarioLogado: logado, colunasConteudo: logado ? 10 : 12, colunasMenu: logado ? 2 : 0 });
    }

    render() {
        const { state } = this;
        return (
            <Container fluid="true" className="bg-dark">
                <Row style={{ height: '880px' }}>
                    <Col md={state.colunasMenu}>
                        <Saldo />
                    </Col>
                    <Col md={state.colunasConteudo} className="bg-dark">
                        <Routes />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default ConteudoFinannceiro;