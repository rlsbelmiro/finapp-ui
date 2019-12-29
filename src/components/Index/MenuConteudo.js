import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

class MenuConteudo extends Component {

    render() {
        return (
            <Navbar bg="secondary" variant="dark" expand="lg" className="border">
                <Navbar.Toggle aria-controls="menuConteudo" />
                <Navbar.Collapse id="menuConteudo">
                    <Nav className="mr-auto">
                        <Link className="nav-link" to="/">Home</Link>
                        <Link className="nav-link" to="/agenda">Agenda</Link>
                        <Link className="nav-link" to="/lancamentos">Lançamentos</Link>
                        <Link className="nav-link" to="/">Extrato</Link>
                        <Link className="nav-link" to="/">Fluxo de caixa</Link>
                    </Nav>                   
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default MenuConteudo;