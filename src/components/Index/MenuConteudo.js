import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

class MenuConteudo extends Component {
    static defaultProps = {
        exibir: true,
        clsIcone: 'material-icons md-18 mr-2',
        clsNav: 'mr-auto flex-column mt-2'
    }

    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Nav className={this.props.clsNav}>

                <Link className="nav-link text-white border-bottom hover-conteudo" to="/">
                    <i className={this.props.clsIcone}>house</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Home</span>
                </Link>
                <Link className="nav-link text-white border-bottom hover-conteudo" to="/agenda">
                    <i className={this.props.clsIcone}>calendar_today</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Agenda</span>
                </Link>
                <Link className="nav-link text-white border-bottom hover-conteudo" to="/lancamentos">
                    <i className={this.props.clsIcone}>attach_money</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Lançamentos</span>
                </Link>
                <Link className="nav-link text-white border-bottom hover-conteudo" to="/">
                    <i className={this.props.clsIcone}>playlist_add_check</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Extrato</span>
                </Link>
                <Link className="nav-link text-white border-bottom hover-conteudo" to="/fluxocaixa">
                    <i className={this.props.clsIcone}>account_balance_wallet</i>
                    <span style={{ display: this.props.exibir ? '' : 'none' }} className="h6 align-top">Fluxo de caixa</span>
                </Link>
            </Nav>
        )
    }
}

export default MenuConteudo;