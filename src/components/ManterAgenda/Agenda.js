import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AgendaService } from '../../service/AgendaService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import AgendaDetalhe from './AgendaDetalhe';
import LancamentoPay from '../ManterLancamento/LancamentoPay';
import { Channel } from '../../service/EventService';
import LancamentoForm from '../ManterLancamento/LancamentoForm';




class Agenda extends Component {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.obterTotal = this.obterTotal.bind(this);
        this.carregarOutroMes = this.carregarOutroMes.bind(this);
        this.carregarEventosDoMes = this.carregarEventosDoMes.bind(this);
        this.carregarDetalhesEvento = this.carregarDetalhesEvento.bind(this);

        this.state = {
            agenda: [],
            events: [],
            aguardar: true,
            detalharLancamentos: false
        }


    }

    calendarRef = React.createRef();

    componentDidMount() {
        this.onLoad();
    }

    async onLoad() {
        var resposta = await AgendaService.list();
        if (resposta.sucesso) {
            
            this.carregarEventosDoMes(resposta);
        } else {
            alert(resposta.mensagem);
            this.setState({ aguardar: false });
        }
    }

    carregarEventosDoMes(resposta) {
        this.setState({ agenda: resposta.objeto });
        var events = new Array();
        for (var x = 0; x < this.state.agenda.length; x++) {
            var ag = this.state.agenda[x];
            var data = ag.dataVencimento.split('/');
            var event = {
                id: ag.id,
                title: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ag.valor.toString().replace('-', '')),
                date: data[2] + '-' + data[1] + '-' + data[0],
                backgroundColor: ag.tipo === 'DEBITO' ? 'red' : 'green',
                textColor: 'white',
                borderColor: 'white',
                classNames: ['evento']
            }
            events.push(event);
        }

        this.setState({ events: events, aguardar: false });
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
        var resposta = await AgendaService.list(mes, ano);
        if (resposta.sucesso) {
            let calendarApi = this.calendarRef.current.getApi();
            var data = calendarApi.getDate();
            this.setState({ agenda: resposta.objeto });
            this.carregarEventosDoMes(resposta);
        } else {
            alert(resposta.mensagem);
            this.setState({ aguardar: false });
        }
    }

    obterTotal(tipo) {
        const { state } = this;
        var total = 0;
        switch (tipo) {
            case "CREDITO":
                var lctos = state.agenda.filter(function (obj) { return obj.tipo == "CREDITO" });
                lctos.map(lcto => { total += lcto.valor; });
                break;
            case "DEBITO":
                var lctos = state.agenda.filter(function (obj) { return obj.tipo == "DEBITO" });
                lctos.map(lcto => { total += lcto.valor; });
                break;
            case "SALDO":
                var lctoC = state.agenda.filter(function (obj) { return obj.tipo == "CREDITO" });
                var lctoD = state.agenda.filter(function (obj) { return obj.tipo == "DEBITO" });
                var totalC = 0;
                var totalD = 0;
                lctoC.map(lcto => { totalC += lcto.valor; });
                lctoD.map(lcto => { totalD += lcto.valor; });
                total = totalC - totalD;

        }

        return total;
    }

    carregarDetalhesEvento(info){
        const { agenda } = this.state,
            index = agenda.findIndex(lcto => lcto.id == info.event.id);

        var ag = this.state.agenda[index];

        Channel.emit('agendaDetalhe:view',ag);
        
    }

    render() {
        const { state } = this;

        return (
            <div id="manterAgenda">
                <LancamentoForm habilitarNovoLcto={false} />
                <LancamentoPay />
                <AgendaDetalhe />
                <div className="load" style={{ display: (state.aguardar ? 'block' : 'none') }} ><i className="fa fa-cog fa-spin fa-3x fa-fw"></i>Aguarde...</div>
                <div style={{ display: (state.aguardar ? 'none' : 'block') }}>
                    <Container fluid="true">
                        <Row>
                            <Col md="12">
                                <FullCalendar
                                    ref={this.calendarRef}
                                    defaultView="dayGridMonth"
                                    plugins={[dayGridPlugin]}
                                    events={state.events}
                                    locale="pt-BR"
                                    header={{ left: 'btnMesAnterior, btnProximoMes', center: 'title', right: '' }}
                                    buttonText={{'today':'Hoje'}}
                                    customButtons={{
                                        btnProximoMes: {
                                            'text': 'Próximo mês >>',
                                            'click': () => this.carregarOutroMes(false)
                                        },
                                        btnMesAnterior: {
                                            'text': '<< Mês anterior',
                                            'click': () => this.carregarOutroMes(true)
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