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
import { Switch, Route, Link } from 'react-router-dom';


import './style.scss';
import FluxoCaixa from './components/ManterFluxoCaixa/FluxoCaixa';
import ConteudoFinannceiro from './components/Index/ConteudoFinanceiro';

function App() {
  return (
    <div className="App">
      <MenuPrincipal />
      <ConteudoFinannceiro />
    </div>
  );
}

export default App;
