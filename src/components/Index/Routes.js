import React from 'react';
import { Switch, Route, Link, Redirect } from 'react-router-dom';
import Lancamento from '../ManterLancamento/Lancamento';
import Agenda from '../ManterAgenda/Agenda';
import FluxoCaixa from '../ManterFluxoCaixa/FluxoCaixa';
import { isLogged } from '../Commons/Auth';
import Login from '../Commons/Login';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        isLogged() ? (
            <Component {...props} />
        ) : (
                <Redirect to={{ pathname: '/', state: { from: props.location } }} />
            )
    )} />
);

const Routes = () => (
    <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute exact path="/lancamentos" component={Lancamento} ></PrivateRoute>
        <PrivateRoute exact path="/agenda" component={Agenda} ></PrivateRoute>
        <PrivateRoute exact path="/fluxocaixa" component={FluxoCaixa} ></PrivateRoute>
    </Switch>
);

export default Routes;