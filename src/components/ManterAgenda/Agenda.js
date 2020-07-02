import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import AgendaDetalhe from './AgendaDetalhe';
import LancamentoPay from '../ManterLancamento/LancamentoPay';
import { Channel } from '../../service/EventService';
import LancamentoForm from '../ManterLancamento/LancamentoForm';
import LancamentoSearch from '../ManterLancamento/LancamentoSearch';
import { LancamentoService } from '../../service/LancamentoService';

import * as date from '../../utils/date';



class Agenda extends Component {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.obterTotal = this.obterTotal.bind(this);
        this.carregarOutroMes = this.carregarOutroMes.bind(this);
        this.carregarEventosDoMes = this.carregarEventosDoMes.bind(this);
        this.carregarDetalhesEvento = this.carregarDetalhesEvento.bind(this);
        this.pesquisarLancamentos = this.pesquisarLancamentos.bind(this);
        this.limparPesquisa = this.limparPesquisa.bind(this);

        this.state = {
            agenda: [],
            events: [],
            aguardar: true,
            detalharLancamentos: false,
            filtro: {},
            anoAtual: 0,
            mesAtual: 0,
            filtrouNoBanco: false
        }


    }

    calendarRef = React.createRef();

    componentDidMount() {
        this.onLoad();
        Channel.on('lancamento:search', this.pesquisarLancamentos);
        Channel.on('lancamento:list', this.limparPesquisa);
    }

    componentWillUnmount() {
        Channel.removeListener('lancamento:search', this.pesquisarLancamentos);
        Channel.removeListener('lancamento:list', this.limparPesquisa);
    }

    async onLoad() {
        let mes = this.state.mesAtual;
        let ano = this.state.anoAtual;
        var resposta = await LancamentoService.calendar(mes, ano);
        if (resposta.success) {
            this.carregarEventosDoMes(resposta.data);
        } else {
            this.setState({ aguardar: false });
        }
    }



    carregarEventosDoMes(objeto) {
        this.setState({ agenda: objeto });
        var events = new Array();
        for (var x = 0; x < this.state.agenda.length; x++) {
            var ag = this.state.agenda[x];
            if (!ag.ocultar) {
                var event = {
                    id: x + 1,
                    title: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ag.value.toString().replace('-', '')),
                    date: date.removerHoraData(ag.date, true),
                    backgroundColor: ag.type === 2 ? 'red' : 'green',
                    textColor: 'white',
                    borderColor: 'white',
                    classNames: ['evento']
                }
                events.push(event);
            }
        }
        let calendarApi = this.calendarRef.current.getApi();
        var data = calendarApi.getDate();
        var mes = 0;
        var ano = 0;
        data = calendarApi.getDate();
        mes = data.getMonth();
        ano = data.getFullYear();
        this.setState({ events: events, aguardar: false, mesAtual: mes + 1, anoAtual: ano });
    }

    async carregarOutroMes(anterior) {
        let calendarApi = this.calendarRef.current.getApi();
        var data = calendarApi.getDate();
        var mes = 0;
        var ano = 0;
        if (anterior) {
            calendarApi.prev();
            data = calendarApi.getDate();
            mes = data.getMonth();
            ano = data.getFullYear();
        } else {
            calendarApi.next();
            data = calendarApi.getDate();
            mes = data.getMonth();
            ano = data.getFullYear();
        }
        this.setState({ aguardar: true });
        mes++;
        var resposta = await LancamentoService.calendar(mes, ano);
        if (resposta.success) {
            let calendarApi = this.calendarRef.current.getApi();
            var data = calendarApi.getDate();
            this.setState({ agenda: resposta.data, mesAtual: mes + 1, anoAtual: ano });
            this.carregarEventosDoMes(resposta.data);
        } else {
            this.setState({ aguardar: false });
        }
    }

    obterTotal(tipo) {
        const { state } = this;
        var total = 0;
        switch (tipo) {
            case "CREDITO":
                var lctos = state.agenda.filter(function (obj) { return obj.type == 1 });
                lctos.map(lcto => { total += lcto.value; });
                break;
            case "DEBITO":
                var lctos = state.agenda.filter(function (obj) { return obj.type == 2 });
                lctos.map(lcto => { total += lcto.value; });
                break;
            case "SALDO":
                var lctoC = state.agenda.filter(function (obj) { return obj.type == 1 });
                var lctoD = state.agenda.filter(function (obj) { return obj.type == 2 });
                var totalC = 0;
                var totalD = 0;
                lctoC.map(lcto => { totalC += lcto.value; });
                lctoD.map(lcto => { totalD += lcto.value; });
                total = totalC - totalD;

        }

        return total;
    }

    carregarDetalhesEvento(info) {
        const { agenda } = this.state,
            index = agenda.findIndex(lcto => lcto.id == info.event.id);

        var ag = this.state.agenda[index];

        Channel.emit('agendaDetalhe:view', ag);
    }

    async pesquisarLancamentos(filtro) {
        const { agenda } = this.state;

        if (filtro.carteira.id > 0 || filtro.cartao.id > 0) {
            filtro.mes = this.state.mesAtual + 1;
            filtro.ano = this.state.anoAtual;

            var resposta = await LancamentoService.calendar();
            if (resposta.sucesso) {
                this.carregarEventosDoMes(resposta.objeto);
            } else {
                alert(resposta.mensagem);
                this.carregarEventosDoMes([]);
            }
            this.setState({ filtrouNoBanco: true });
        } else {
            for (var x = 0; x < agenda.length; x++) {
                var ag = agenda[x];
                ag.ocultar = filtro.tipo != null && filtro.tipo !== ag.tipo;
                if (!ag.ocultar)
                    ag.ocultar = filtro.situacao != null && filtro.situacao !== ag.situacao

            }
            this.carregarEventosDoMes(agenda);
            this.setState({ filtrouNoBanco: false });
        }

    }

    limparPesquisa() {
        const { agenda } = this.state;

        if (this.state.filtrouNoBanco) {
            this.setState({ aguardar: true });
            this.onLoad();
        } else {
            for (var x = 0; x < agenda.length; x++) {
                agenda[x].ocultar = false;
            }

            this.carregarEventosDoMes(agenda);
        }
    }



    render() {
        const { state } = this;

        return (
            <div id="manterAgenda">
                <LancamentoForm habilitarNovoLcto={false} />
                <LancamentoPay />
                <AgendaDetalhe />
                <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ></div>
                <div style={{ display: (state.aguardar ? 'none' : 'block') }}>

                    <Container fluid="true">
                        <LancamentoSearch pesquisarPorData={false} />
                        <Row>
                            <Col md="12">
                                <FullCalendar
                                    height={650}
                                    ref={this.calendarRef}
                                    defaultView="dayGridMonth"
                                    plugins={[dayGridPlugin]}
                                    events={state.events}
                                    locale="pt-BR"
                                    header={{ left: 'btnMesAnterior, btnProximoMes, btnAtualizar', center: 'title', right: '' }}
                                    buttonText={{ 'today': 'Hoje' }}
                                    customButtons={{
                                        btnProximoMes: {
                                            'text': 'Próximo mês >>',
                                            'click': () => this.carregarOutroMes(false)
                                        },
                                        btnMesAnterior: {
                                            'text': '<< Mês anterior',
                                            'click': () => this.carregarOutroMes(true)
                                        },
                                        btnAtualizar: {
                                            'text': 'Atualizar',
                                            'click': () => this.onLoad()
                                        }
                                    }}
                                    eventClick={this.carregarDetalhesEvento} />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={{ span: 8, offset: 4 }}>
                                <CardDeck>
                                    <Card border="success" text="success" style={{ width: "200px" }}>
                                        <Card.Header>Total receitas</Card.Header>
                                        <Card.Body>
                                            <Card.Title>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(this.obterTotal("CREDITO"))
                                                }
                                            </Card.Title>
                                        </Card.Body>
                                    </Card>
                                    <Card border="danger" text="danger" style={{ width: "200px" }}>
                                        <Card.Header>Total despesas</Card.Header>
                                        <Card.Body>
                                            <Card.Title>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(this.obterTotal("DEBITO"))
                                                }
                                            </Card.Title>
                                        </Card.Body>
                                    </Card>
                                    <Card border={this.obterTotal("SALDO") >= 0 ? "primary" : "danger"} text={this.obterTotal("SALDO") >= 0 ? "primary" : "danger"} style={{ width: "200px" }}>
                                        <Card.Header>Saldo</Card.Header>
                                        <Card.Body>
                                            <Card.Title>
                                                {
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(this.obterTotal("SALDO"))
                                                }
                                            </Card.Title>
                                        </Card.Body>
                                    </Card>
                                </CardDeck>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }
}

export default Agenda;