import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Channel } from '../../service/EventService';
import Button from 'react-bootstrap/Button';
import { LancamentoService } from '../../service/LancamentoService';
import { Row, Col, Table, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LancamentoList from '../ManterLancamento/LancamentoList';

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
                periodoInicio: '',
                periodoFim: '',
                tipo: '',
                data: 'SELECIONARDATAS'
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
                periodoInicio: '',
                periodoFim: '',
                tipo: '',
                data: 'SELECIONARDATAS'
            }
        });
    }

    onLoad(obj) {
        var flt = this.state.filtro;
        flt.tipo = obj.tipo;
        var dataIni = obj.periodoInicio ? obj.periodoInicio.split('/') : obj.dataVencimento.split('/');
        var dataFim = obj.periodoFim ? obj.periodoFim.split('/') : obj.dataVencimento.split('/');
        flt.periodoInicio = dataIni[2] + '-' + dataIni[1] + '-' + dataIni[0];
        flt.periodoFim = dataFim[2] + '-' + dataFim[1] + '-' + dataFim[0];
        if(obj.categorias){
            flt.categorias = obj.categorias;
        }
        this.setState({ show: true, filtro: flt, valor: obj.valor, dia: obj.dataVencimento });
    }

    getLancamento(id){
        Channel.emit('lancamento:edit',id);
    }

    render() {
        const { state } = this;
        return (
            <Modal show={this.state.show} onHide={this.handleClose} size="lg">
                <Modal.Header className={state.filtro.tipo === "DEBITO" ? "bg-danger text-white" : "bg-success text-white"} closeButton>
                    <Modal.Title>
                        Lançamentos de {state.filtro.tipo} do dia {state.dia} <br />
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