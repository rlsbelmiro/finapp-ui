import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { CaixaService } from '../../service/CaixaService';
import { Channel } from '../../service/EventService';

class Saldo extends Component {
    constructor(props){
        super(props);

        this.carregarSaldo = this.carregarSaldo.bind(this);
        this.state = {
            totalReceitas: 0,
            totalDespesas: 0,
            saldo: 0
        }
    }

    componentDidMount(){
        this.carregarSaldo();
        Channel.on('lancamento:list',this.carregarSaldo);
    }

    componentWillUnmount(){
        Channel.removeListener('lancamento:list',this.carregarSaldo);
    }

    async carregarSaldo(){
        var resposta = await CaixaService.obterSaldo();
        if(resposta.sucesso){
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
            <div>
                <Row className="border-bottom">
                    <Col md="12" className="text-center"><label className="font-weight-bold align-center mt-1 h5 text-truncate text-white" style={{maxWidth: "200px"}}>RLSoft Ltda</label></Col>
                </Row>
                <Row className="pt-3 bg-dark border-bottom">
                    <Col md="12" className={state.saldo < 0 ? 'text-center h3 text-danger bg-dark mt-2 rounded' : 'text-center h3 text-success bg-dark mt-2 rounded'}>

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
                <Row className="pt-2 bg-dark rounded">
                    <Col md="6" sm="12" xs="6" className="text-center text-success border-right">

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
                    <Col md="6" sm="12" xs="6" className="text-center text-danger">

                        <i className="material-icons md-18">call_received</i>
                        <label className="h6">
                            {   
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(state.totalDespesas)
                            }
                        </label>

                    </Col>
                </Row>
            </div>
        )
    }
}

export default Saldo;