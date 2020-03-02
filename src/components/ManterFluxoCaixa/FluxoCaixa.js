import React, { Component } from 'react';
import FluxoCaixaCategoria from './FluxoCaixaCategoria';
import FluxoCaixaCarteira from './FluxoCaixaCarteira';
import { Tabs, Row, Col, ButtonGroup, ButtonToolbar, Dropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
import LancamentoForm from '../ManterLancamento/LancamentoForm';
import { Channel } from '../../service/EventService';
import * as date from '../../utils/date.js';
import { LancamentoService } from '../../service/LancamentoService';


class FluxoCaixa extends Component {

    constructor(props) {
        super(props);

        this.handleTabs = this.handleTabs.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeField = this.handleChangeField.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.getDescricaoSituacao = this.getDescricaoSituacao.bind(this);

        this.state = {
            fluxoPorCarteira: false,
            fluxoPorCategoria: true,
            tabAtiva: 'categoria',
            situacao: [],
            carteiras: [],
            categorias: [],
            filtro: {
                situacao: ''
            },
            agrupamento: {
                qtdPeriodos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                tiposPeriodo: ['Semana', 'Mês', 'Bimestre', 'Trimestre', 'Semestre', 'Ano'],
                dataInicial: '',
                qtd: 6,
                tipo: 'Mês'
            }
        }
    }

    componentDidMount() {
        this.onLoad();
    }

    async onLoad(){
        let agrupamento = this.state.agrupamento;
        var data = Intl.DateTimeFormat("pt-BR").format(new Date());
        var dt = data.split('/');
        agrupamento.dataInicial = dt[2] + '-' + dt[1] + '-' + dt[0];

        var resposta = await LancamentoService.getFiltros();
        this.setState({
            situacao: resposta.situacao,
            carteiras: resposta.carteiras,
            categorias: resposta.categorias,
            agrupamento: agrupamento
        });
    }

    handleTabs(key) {
        this.setState({
            tabAtiva: key,
            fluxoPorCategoria: key === "categoria",
            fluxoPorCarteira: key === "carteira"
        })
    }

    handleChange(campo, valor) {
        let agrupamento = this.state.agrupamento;
        let filtro = this.state.filtro;
        switch (campo) {
            case "agrupar_qtd":
                agrupamento.qtd = valor;
                break;
            case "agrupar_tipo":
                agrupamento.tipo = valor;
                break;
            case "situacao":
                filtro.situacao = valor;
                break;
        }

        this.setState({ agrupamento: agrupamento, filtro: filtro });
    }

    handleChangeField(event){
        const { target } = event;
        let agrupamento = this.state.agrupamento;
        switch(target.name){
            case "dataInicio":
                agrupamento.dataInicial = target.value;
                break;
        }

        this.setState({agrupamento: agrupamento});
    }

    handleSubmit() {
        Channel.emit('fluxoCaixa:agrupar', true);
    }

    getDescricaoSituacao(x) {
        var retorno = "";
        switch (x) {
            case "PREVISTO":
                retorno = "Previsto";
                break;
            case "LIQUIDADO":
                retorno = "Liquidado";
                break;
            case "LIQUIDADOPARCIAL":
                retorno = "Liquidado parcial";
                break;
            case "CANCELADO":
                retorno = "Cancelado";
                break;
        }

        return retorno;
    }

    render() {
        const { state } = this;
        return (
            <div id="fluxoDeCaixa">
                <Row className="ml-1">
                    <Col md="2" className="text-center text-success p-2 bg-light border rounded-lg border-success ">
                        <i className="material-icons md-24 mt-2">search</i>
                        <label className="h6 align-top mt-2">Agrupamento</label>
                    </Col>
                    <Col md="10" className="text-center p-2 bg-ligth border-2 border-bottom border-success">
                        <ButtonToolbar>
                            <ButtonGroup className="mr-2">
                                <Dropdown id="agrupar_qtd" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Qt Períodos: {state.agrupamento.qtd}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.agrupamento.qtdPeriodos.map(x =>
                                                <Dropdown.Item className={x == state.agrupamento.qtd ? 'active' : ''} onClick={() => this.handleChange("agrupar_qtd", x)}>{x}</Dropdown.Item>
                                            )
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown id="agrupar_tipo" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Tipo: {state.agrupamento.tipo}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.agrupamento.tiposPeriodo.map(x =>
                                                <Dropdown.Item className={x == state.agrupamento.tipo ? 'active' : ''} onClick={() => this.handleChange("agrupar_tipo", x)}>{x}</Dropdown.Item>
                                            )
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>

                                <InputGroup className="mr-1">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="dataInicio">
                                            <i className="material-icons md-18 mr-2">date_range</i>
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control type="date" id="dataInicio" aria-describedby="dataInicio" name="dataInicio" value={state.agrupamento.dataInicial}
                                                    onChange={this.handleChangeField} />
                                </InputGroup>

                                <Dropdown id="pesquisa_status" className="mr-1">
                                    <Dropdown.Toggle variant="success">
                                        Situação: {this.getDescricaoSituacao(state.filtro.situacao)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {
                                            state.situacao.map(x =>
                                                <Dropdown.Item className={state.filtro.situacao === x ? 'active' : ''} onClick={() => this.handleChange('situacao', x)}>{this.getDescricaoSituacao(x)}</Dropdown.Item>
                                            )
                                        }
                                        <hr />
                                        <Dropdown.Item onClick={() => this.handleChange('situacao', null)}>Todos</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Button variant="success" onClick={this.handleSubmit}>Gerar</Button>

                            </ButtonGroup>
                        </ButtonToolbar>

                    </Col>
                </Row>
                <LancamentoForm habilitarNovoLcto={false} />
                <Tabs id="tabFluxoCaixa" activeKey={state.tabAtiva} onSelect={this.handleTabs}>
                    <Tab eventKey="categoria" title="Por categoria">
                        <FluxoCaixaCategoria exibir={state.fluxoPorCategoria} qtd={state.agrupamento.qtd} tipoPeriodo={state.agrupamento.tipo} dataInicial={state.agrupamento.dataInicial} />
                    </Tab>
                    <Tab eventKey="carteira" title="Por carteira">
                        <FluxoCaixaCarteira exibir={state.fluxoPorCarteira} qtd={state.agrupamento.qtd} tipoPeriodo={state.agrupamento.tipo} dataInicial={state.agrupamento.dataInicial} />
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

export default FluxoCaixa;