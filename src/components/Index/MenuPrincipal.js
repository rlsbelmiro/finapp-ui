import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

class MenuPrincipal extends Component {

    render() {
        return (
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="#home">FinApp - Finanças</Navbar.Brand>
                <Navbar.Toggle aria-controls="menuConteudo" />
                <Navbar.Collapse id="menuConteudo">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">Vendas</Nav.Link>
                        <Nav.Link href="#home">Financeiro</Nav.Link>
                        <Nav.Link href="#home">Cadastros</Nav.Link>
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