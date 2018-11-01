import React, {Component} from 'react';
import styled from 'styled-components';
import {compose} from "recompose";
import withApiId from "./withApiId";
const io = require('socket.io-client');


const LogContainer = styled.div`
  background: #383732;
  
  height: auto;
  width: 100%;
  
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
`;

const Line = styled.div`
  color: #82ff0b;
  height: 22px;
  line-height: 22px;
  font-weight: bold;
  font-family: "Fira Mono","DejaVu Sans Mono",Menlo,Consolas,"Liberation Mono",Monaco,"Lucida Console",monospace;
`;

const ScrollView = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;


class LoggerRaw extends Component {



  constructor() {
    super();
    this.fifo = [];
    this.state = {log: this.fifo};
    this.pushLine = this.pushLine.bind(this);
  }

  componentDidMount() {
    const socket = io.connect('/');
    socket.on('connect', () => {
      this.pushLine('[Connected]')
    });

    socket.on('disconnect', () => {
      this.pushLine('[Disconnected]')
    });

    socket.emit('room', this.props.apiId);
    socket.on('log', this.pushLine);
  }

  pushLine(line) {
    if (this.fifo.length > 100)
      this.fifo.shift();

    this.fifo.push(line);

    if (this.refresh) {
      clearTimeout(this.refresh)
    }

    this.refresh = setTimeout(() => {
      this.setState({log: this.fifo});
      this.scrollToBottom();
      this.refresh = null;
    }, 100);
  }



  scrollToBottom = () => {
    if (this.messagesEnd)
      this.messagesEnd.scrollIntoView();
  };

  render() {
    return (
        <ScrollView>
          <LogContainer>
            {this.state.log.map((item) => <Line ref={(el) => { this.messagesEnd = el; }}>{item}</Line>)}
          </LogContainer>
        </ScrollView>
    );
  }
}


export default compose(
  withApiId
)(LoggerRaw);
