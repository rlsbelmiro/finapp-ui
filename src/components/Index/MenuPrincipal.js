import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import MenuConteudo from './MenuConteudo';
import { isLogged } from '../Commons/Auth';
import { Channel } from '../../service/EventService';

class MenuPrincipal extends Component {
    constructor(props){
        super(props);

        this.sair = this.sair.bind(this);
        this.validarAcessos = this.validarAcessos.bind(this);

        this.state = {
            usuarioLogado: isLogged()
        }
    }

    componentDidMount(){
        Channel.on('login',this.validarAcessos);
    }

    componentWillUnmount(){
        Channel.removeListener('login',this.validarAcessos);
    }

    validarAcessos(){
        this.setState({usuarioLogado: isLogged()});
    }

    sair(){
        if(isLogged()){
            localStorage.removeItem('token');
            Channel.emit('login',false);
            this.props.history.push("/");
        }
    }

    render() {
        return (
            <Navbar bg="success" variant="dark" expand="lg" className="shadow">
                <Navbar.Brand href="#home">FinApp - Finanças</Navbar.Brand>
                <Navbar.Toggle aria-controls="menuConteudo" />
                <Navbar.Collapse id="menuConteudo">
                    <MenuConteudo  />
                </Navbar.Collapse>
                <a className="nav-link text-white hover-conteudo" href="#" onClick={this.sair} style={{display: this.state.usuarioLogado ? '' : 'none'}}>
                    <i className="material-icons md-18 mr-2">settings_power</i>
                    <span className="h6 align-top">Sair</span>
                </a>
            </Navbar>
        )
    }
}

export default MenuPrincipal;