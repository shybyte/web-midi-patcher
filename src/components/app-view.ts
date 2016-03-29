import * as React from 'react';
import * as ReactDOM from 'react-dom';



class AppView extends  React.Component<any,any> {
  render() {
    return React.DOM.div({}, 'View');
  }
}

const appView = React.createFactory(AppView);


function render() {
  ReactDOM.render(appView() ,document.getElementById('app'));
}

export default render;