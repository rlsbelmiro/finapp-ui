import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Saldo from './Saldo';
import MenuConteudo from './MenuConteudo';
import { Switch, Route, Link } from 'react-router-dom';
import Lancamento from '../ManterLancamento/Lancamento';
import Agenda from '../ManterAgenda/Agenda';
import FluxoCaixa from '../ManterFluxoCaixa/FluxoCaixa';

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

    exibirEsconderMenu(){
        const { state } = this;
        if(state.colunasMenu == 2){
            this.setState({colunasMenu: 1, colunasConteudo: 11, menuRetraido: true, clsIcone: 'material-icons md-36 mr-2', clsNav: 'mr-auto flex-column mt-2 text-center'});
        } else {
            this.setState({colunasMenu: 2, colunasConteudo: 10, menuRetraido: false, clsIcone: 'material-icons md-18 mr-2', clsNav: 'mr-auto flex-column mt-2'});
        }
    }

    render() {
        const { state } = this;
        return (
            <Container fluid="true">
                <Row>
                    <Col md={state.colunasMenu} className="border bg-success">
                        <Saldo exibir={!state.menuRetraido}  />
                        <MenuConteudo exibir={!state.menuRetraido} clsIcone={state.clsIcone} clsNav={state.clsNav} />
        <p className="text-right mt-4"><Link className="h3 text-white" onClick={this.exibirEsconderMenu}><i class="material-icons md-36">{state.menuRetraido ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}</i></Link></p>
                    </Col>
                    <Col md={state.colunasConteudo} className="pl-0 pr-0 bg-light pb-4">
                        <Switch>
                            <Route path="/lancamentos" component={Lancamento} ></Route>
                            <Route path="/agenda" component={Agenda} ></Route>
                            <Route path="/fluxocaixa" component={FluxoCaixa} ></Route>
                        </Switch>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default ConteudoFinannceiro;