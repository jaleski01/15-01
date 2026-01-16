import { AppRegistry } from 'react-native';
import App from './App';

// Garante que o App ocupe 100% da altura na Web
const rootStyle = document.createElement('style');
rootStyle.textContent = `
  html, body, #root { 
    height: 100%; 
    width: 100%; 
    display: flex; 
    flex-direction: column; 
  } 
  #root > div { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
  }
`;
document.head.appendChild(rootStyle);

const appName = 'main';

// Registra o App
AppRegistry.registerComponent(appName, () => App);

// Monta no DOM
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});