import React, { Component } from 'react';
import FluxoCaixaCategoria from './FluxoCaixaCategoria';
import FluxoCaixaCarteira from './FluxoCaixaCarteira';
import { Tabs } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
import LancamentoSearch from '../ManterLancamento/LancamentoSearch';
import LancamentoForm from '../ManterLancamento/LancamentoForm';


class FluxoCaixa extends Component {

    constructor(props) {
        super(props);

        this.handleTabs = this.handleTabs.bind(this);

        this.state = {
            fluxoPorCarteira: false,
            fluxoPorCategoria: true,
            tabAtiva: 'categoria'
        }
    }

    handleTabs(key) {
        this.setState({
            tabAtiva: key,
            fluxoPorCategoria: key === "categoria",
            fluxoPorCarteira: key === "carteira"
        })
    }
    render() {
        const { state } = this;
        return (
            <div id="fluxoDeCaixa">
                <LancamentoSearch />
                <LancamentoForm habilitarNovoLcto={false} />
                <Tabs id="tabFluxoCaixa" activeKey={state.tabAtiva} onSelect={this.handleTabs}>
                    <Tab eventKey="categoria" title="Por categoria">
                        <FluxoCaixaCategoria exibir={state.fluxoPorCategoria} />
                    </Tab>
                    <Tab eventKey="carteira" title="Por carteira">
                        <FluxoCaixaCarteira exibir={state.fluxoPorCarteira} />
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

export default FluxoCaixa;