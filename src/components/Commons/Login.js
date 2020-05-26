import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

import { AcessoService } from '../../service/AcessoService';
import { Channel } from '../../service/EventService';


class Login extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.autenticar = this.autenticar.bind(this);

        this.state = {
            login: "",
            password: "",
            message: "",
            carregando: false
        }

    }

    handleChange(event) {
        const { target } = event;
        switch (target.name) {
            case "email":
                this.setState({ login: target.value });
                break;
            case "password":
                this.setState({ password: target.value });
                break;
        }
    }

    async autenticar() {
        this.setState({ mensagem: "", carregando: true });
        const { state } = this;
        var resposta = await AcessoService.autenticar(state.login, state.password);
        if (resposta.success) {
            localStorage.setItem('token', resposta.data.tokenAcesso);
            this.setState({ mensagem: "", carregando: false });
            Channel.emit('login', true);
            this.props.history.push("/lancamentos");
        } else {
            this.setState({ message: resposta.message, carregando: false });
        }


    }

    render() {
        const { state } = this;
        return (
            <>
                <div className="load-100" style={{ display: !state.carregando ? 'none' : '' }}></div>
                <div id="divLogin" style={{ display: state.carregando ? 'none' : '' }}>
                    <h3 className="text-center text-white">Seja bem-vindo!</h3>
                    <h5 className="text-center text-white">Informe seus dados para acesso</h5>
                    <hr />
                    <Form>
                        <Form.Row>
                            <Col>
                                <Form.Group controlId="email">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control id="email" placeholder="Email" md="4" name="email" defaultValue={state.login} onChange={this.handleChange} />
                                </Form.Group>
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Group controlId="password">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control type="password" id="password" placeholder="Senha" name="password" defaultValue={state.password} onChange={this.handleChange} />
                                </Form.Group>
                            </Col>
                        </Form.Row>
                        <h3 className="text-danger" style={{ display: state.message != "" ? '' : 'none' }}>{state.message}</h3>
                        <Form.Row>
                            <Col md="9" className="text-left">
                                <a href="javascript:void(0)" style={{ fontSize: '11px' }}>Esqueci minha senha</a>
                            </Col>
                            <Col md="3" className="text-right">
                                <Button variant="success" onClick={this.autenticar}>Entrar</Button>
                            </Col>
                        </Form.Row>
                    </Form>
                    <Button className="mt-4 p-2" style={{ width: "100%", fontSize: "18px" }} variant="info">Não tem uma conta? Teste agora, grátis por 20 dias</Button>
                </div>
            </>
        )
    }
}

export default Login;