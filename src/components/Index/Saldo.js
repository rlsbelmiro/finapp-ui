import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { CaixaService } from '../../service/CaixaService';
import { Channel } from '../../service/EventService';
import { isLogged } from '../Commons/Auth';

class Saldo extends Component {
    static defaultProps = {
        exibir: true
    }
    constructor(props) {
        super(props);

        this.carregarSaldo = this.carregarSaldo.bind(this);
        this.validarAcessos = this.validarAcessos.bind(this);

        this.state = {
            totalReceitas: 0,
            totalDespesas: 0,
            saldo: 0,
            usuarioLogado: isLogged()
        }
    }

    componentDidMount() {
        this.carregarSaldo();
        Channel.on('lancamento:list', this.carregarSaldo);
        Channel.on('login', this.validarAcessos);
    }

    componentWillUnmount() {
        Channel.removeListener('lancamento:list', this.carregarSaldo);
        Channel.removeListener('login', this.validarAcessos);
    }

    validarAcessos() {
        this.setState({ usuarioLogado: isLogged() });
    }

    async carregarSaldo() {
        var resposta = await CaixaService.obterSaldo();
        if (resposta.sucesso) {
            this.setState({
                totalReceitas: resposta.objeto.totalReceitas,
                totalDespesas: resposta.objeto.totalDespesas,
                saldo: resposta.objeto.saldo
            });
        }
    }
    render() {
        const { state } = this;
        return (
            <div style={{ display: this.props.exibir && state.usuarioLogado ? '' : 'none' }}>
                <Row className="shadow pt-3 bg-info border-bottom">
                    <Col md="12" className={state.saldo < 0 ? 'text-center h3 text-danger mt-2 rounded' : 'text-center h3 text-white mt-2 rounded'}>

                        <i className="material-icons md-36">account_balance</i>
                        <label className="h3 align-top ">
                            {
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(state.saldo)
                            }
                        </label>

                    </Col>
                </Row>
                <Row className="shadow pt-2 bg-info rounded">
                    <Col md="6" sm="12" xs="6" className="text-center text-white border-right">

                        <i className="material-icons md-18">call_made</i>
                        <label className="h6 ">
                            {
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(state.totalReceitas)
                            }
                        </label>

                    </Col>
                    <Col md="6" sm="12" xs="6" className="text-center text-white">

                        <i className="material-icons md-18">call_received</i>
                        <label className="h6">
                            {
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(state.totalDespesas * -1)
                            }
                        </label>

                    </Col>
                </Row>
            </div>
        )
    }
}

export default Saldo;