import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Channel } from '../../service/EventService';
import Button from 'react-bootstrap/Button';
import { LancamentoService } from '../../service/LancamentoService';
import { Row, Col, Table, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LancamentoList from '../ManterLancamento/LancamentoList';

import * as date from '../../utils/date';

class AgendaDetalhe extends Component {
    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.getLancamento = this.getLancamento.bind(this);


        this.state = {
            show: false,
            lancamentos: [],
            valor: 0,
            filtro: {
                types: [],
                typeOfDates: [{
                    name: "SelectedDates",
                    value: 7
                }],
                beginDate: '',
                endDate: ''
            }
        }
    }

    componentDidMount() {
        Channel.on('agendaDetalhe:view', this.onLoad);
    }

    componentWillUnmount() {
        Channel.removeListener('agendaDetalhe:view', this.onLoad);
    }

    handleClose() {
        this.setState({
            show: false,
            lancamentos: [],
            valor: 0,
            dia: '',
            filtro: {
                types: [],
                typeOfDates: [{
                    name: "SelectedDates",
                    value: 7
                }],
                beginDate: '',
                endDate: ''
            }
        });
    }

    onLoad(obj) {
        var flt = this.state.filtro;
        flt.types = new Array();
        flt.types.push({ name: obj.type == 2 ? "DEBIT" : "CREDIT", value: obj.type });
        flt.beginDate = date.removerHoraData(obj.date, true);
        flt.endDate = date.removerHoraData(obj.date, true);
        this.setState({ show: true, filtro: flt, valor: obj.value, dia: date.formatarDataBR(obj.date) });
    }

    getLancamento(id) {
        Channel.emit('lancamento:edit', id);
    }

    render() {
        const { state } = this;
        return (
            <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                <Modal.Header className={state.filtro.tipo === 2 ? "bg-danger text-white" : "bg-success text-white"} closeButton>
                    <Modal.Title>
                        Lançamentos de {state.filtro.tipo === 2 ? "DÉBITO" : "CRÉDITO"} do dia {state.dia} <br />
                        Valor Total:
                        <label className="ml-1">
                            {
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(state.valor)
                            }
                        </label>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <LancamentoList
                                carregarSomentePesquisa={true}
                                filtro={state.filtro}
                                exibirResumo={false}
                                exibirCheckbox={false}
                                exibirId={false}
                                exibirEmissao={false}
                                exibirConta={false}
                                exibirFavorecido={false}
                                exibirParcelamento={false}
                                exibirFaturaCartao={false}
                                exibirHeader={false}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default AgendaDetalhe;