import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import history from "../history";
import Player from "./Player";
import Found404 from "./Found404";

class NYoutubeApp extends React.Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/search" />} />
          <Route exact path="/search" component={Player} />
          <Route component={Found404} />
        </Switch>
      </Router>
    );
  }
}

export default NYoutubeApp;
