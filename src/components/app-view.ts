import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppViewState} from '../app-view-state';

const {div, button} = React.DOM;


class AppView extends React.Component<AppViewState,any> {
  render() {
    const p = this.props;
    return div({},
      p.patches.map(patch =>
        button({
          key: patch.name,
          className: p.currentPatch === patch ? 'selected' : '',
          onClick: () => {
            p.controller.setPatch(patch)
          }
        }, patch.name)
      )
    );
  }
}

const appView = React.createFactory(AppView);


function render(viewState: AppViewState) {
  ReactDOM.render(appView(viewState), document.getElementById('app'));
}

export default render;