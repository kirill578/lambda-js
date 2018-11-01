import React, { Component } from 'react';
import './App.css';
import {Editor} from "./editor";
import styled from 'styled-components';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import Logger from "./Logger";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;


class App extends Component {
  render() {
    return (
        <Container>
          <ContentContainer>
            <Editor />
          </ContentContainer>
          <Logger />
        </Container>
    );
  }
}

export default App;
