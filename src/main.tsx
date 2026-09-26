import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/animations.css';
import './styles/global.css';
import App from './App';
import { iniciarVigiaDaVersao } from './services/versao';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

// A tela confere se é a versão do ar, ao abrir e a cada volta do foco (D541).
iniciarVigiaDaVersao();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
