import React from 'react';
import './App.css';
import MenuPrincipal from './components/Index/MenuPrincipal';
import ConteudoFinanceiro from './components/Index/ConteudoFinanceiro';


import './style.scss';


function App() {
  return (
    <div className="App">
      <MenuPrincipal />
      <ConteudoFinanceiro />
    </div>
  );
}

export default App;
