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
            message: ""
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
        this.setState({ mensagem: "" });
        const { state } = this;
        var resposta = await AcessoService.autenticar(state.login, state.password);
        alert(JSON.stringify(resposta));
        if (resposta.success) {
            localStorage.setItem('token', resposta.data.tokenAcesso);
            Channel.emit('login', true);
            this.props.history.push("/lancamentos");
        } else {
            this.setState({ message: resposta.message });
        }


    }

    render() {
        const { state } = this;
        return (
            <div id="divLogin">
                <h3>Seja bem-vindo, informe seus dados para acesso</h3>
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
                        <Col>
                            <a href="#">Esqueci minha senha</a>
                            <Button className="ml-3" variant="success" onClick={this.autenticar}>Login</Button>
                        </Col>
                    </Form.Row>
                </Form>
                <Button className="mt-4 p-2" style={{ width: "100%", fontSize: "18px" }} variant="info">Quero me cadastrar</Button>
            </div>
        )
    }
}

export default Login;