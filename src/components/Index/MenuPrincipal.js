import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

class MenuPrincipal extends Component {

    render() {
        return (
            <Navbar bg="success" variant="dark" expand="lg" className="shadow">
                <Navbar.Brand href="#home">FinApp - Finanças</Navbar.Brand>
                <Navbar.Toggle aria-controls="menuConteudo" />
                <Navbar.Collapse id="menuConteudo">
                    <Nav className="mr-auto">
                        <Nav.Link className="nav-link text-white border-right hover-conteudo" href="#home">Vendas</Nav.Link>
                        <Nav.Link className="nav-link text-white border-right hover-conteudo" href="#home">Financeiro</Nav.Link>
                        <Nav.Link className="nav-link text-white border-right hover-conteudo" href="#home">Cadastros</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <div>
                    <a href=""><i className="material-icons md-36 md-light">fiber_new</i></a>
                    <a href=""><i className="material-icons md-36 md-light">notifications</i></a>
                    <a href=""><i className="material-icons md-36 md-light">account_circle</i></a>
                </div>
            </Navbar>
        )
    }
}

export default MenuPrincipal;