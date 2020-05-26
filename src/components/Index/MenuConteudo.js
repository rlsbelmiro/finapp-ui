import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { isLogged } from '../Commons/Auth';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { Channel } from '../../service/EventService';


class MenuConteudo extends Component {
    static defaultProps = {
        exibir: true,
        clsIcone: 'material-icons md-18 mr-2',
        clsNav: 'mr-auto flex-column mt-2'
    }

    constructor(props) {
        super(props);

        this.validarAcessos = this.validarAcessos.bind(this);
        this.state = {
            usuarioLogado: isLogged()
        }

    }

    componentDidMount() {
        Channel.on('login', this.validarAcessos);
    }

    componentWillUnmount() {
        Channel.removeListener('login', this.validarAcessos);
    }

    validarAcessos() {
        this.setState({ usuarioLogado: isLogged() });
    }

    render() {
        const { state } = this;
        return (
            <Nav className="mr-auto" style={{ display: state.usuarioLogado ? '' : 'none', marginLeft: '155px' }}>

                <Link className="nav-link text-white border-bottom mr-2 hover-conteudo" to="/home">
                    <i className={this.props.clsIcone}>house</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Home</span>
                </Link>
                <Link className="nav-link text-white border-bottom mr-2  hover-conteudo" to="/agenda">
                    <i className={this.props.clsIcone}>calendar_today</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Agenda</span>
                </Link>
                <Link className="nav-link text-white border-bottom mr-2  hover-conteudo" to="/lancamentos">
                    <i className={this.props.clsIcone}>attach_money</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Lançamentos</span>
                </Link>
                <Link className="nav-link text-white border-bottom mr-2 hover-conteudo" to="/extrato">
                    <i className={this.props.clsIcone}>playlist_add_check</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Extrato</span>
                </Link>
                <Link className="nav-link text-white border-bottom mr-2 hover-conteudo" to="/fluxocaixa">
                    <i className={this.props.clsIcone}>account_balance_wallet</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Fluxo de caixa</span>
                </Link>
            </Nav>
        )
    }
}

export default MenuConteudo;