import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { create as createMobxPersit } from 'mobx-persist';
import { gameStore } from './store';

const hydrate = createMobxPersit({
  jsonify: true,
})

async function main() {
  try {
    await hydrate("mafan", gameStore)
  } catch (e) {
    localStorage.clear();
  }

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
}

void main().catch((e) => console.error(e));

serviceWorker.register();