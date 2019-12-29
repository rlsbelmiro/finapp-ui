import React from 'react';
import './App.css';
import MenuPrincipal from './components/Index/MenuPrincipal';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import MenuConteudo from './components/Index/MenuConteudo';
import Saldo from './components/Index/Saldo';
import Lancamento from './components/ManterLancamento/Lancamento';
import Agenda from './components/ManterAgenda/Agenda';
import { Switch, Route } from 'react-router-dom';


import './style.scss';

function App() {
  return (
    <div className="App">
      <MenuPrincipal />
      <Container fluid="true">
        <Row>
          <Col md="2" className="border bg-secondary"> 
            <Saldo />
          </Col>
          <Col md="10" className="pl-0 pr-0 bg-light pb-4">
            <MenuConteudo />

            <Switch>
              <Route path="/lancamentos" component={Lancamento} ></Route>
              <Route path="/agenda" component={Agenda} ></Route>
            </Switch>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
