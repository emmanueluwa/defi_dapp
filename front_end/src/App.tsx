import React from 'react';
import {DAppProvider, ChainId} from '@usedapp/core'
import { Header } from "./components/Header"
import { Container } from '@material-ui/core'
import { Main } from "./components/Main"

function App() {
  return (
    <DAppProvider config={{
      //gd practice to test on local eg ganache to save time
      // https://github.com/EthWorks/useDApp/issues/408         supprotedChains depracated
      supportedChains: [ChainId.Kovan],
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
      }
    }}>
      <Header />
      <Container maxWidth="md">
      </Container>
      <Main />
    </DAppProvider>
  );
}

export default App;
