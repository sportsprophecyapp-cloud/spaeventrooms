import { registerRootComponent } from 'expo';

import App from './App';


// Filter out known benign warnings
const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Blocked aria-hidden on an element')) {
        return;
    }
    originalConsoleError(...args);
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
