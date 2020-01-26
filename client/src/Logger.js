import React, {Component} from 'react';
import styled from 'styled-components';
import {compose} from "recompose";
import { InputGroup } from "@blueprintjs/core";
import withApiId from "./withApiId";
const io = require('socket.io-client');
const processString = require('react-process-string');
const urlRegex = require('url-regex')({exact: false, strict: true});


const LogContainer = styled.div`
  
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
  line-height: 22px;
  font-weight: bold;
  font-family: "Fira Mono","DejaVu Sans Mono",Menlo,Consolas,"Liberation Mono",Monaco,"Lucida Console",monospace;
`;

const ScrollView = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const Url = styled.a`
  color: #FFFFFF;
  
  &:hover {
    color: #FFFFFF;
  }
`;


const LoggerContainer = styled.div`
  background: #383732;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InputContainer = styled.div`
  padding: 10px;
  width: 200px;
  align-self: flex-end;
`;



const CustomLine = ({str}) =>
    <Line>
      {processString(config)(str)}
    </Line>;


let config = [{
  regex: urlRegex,
  fn: (key, result) => <span key={key}>
       <Url target="_blank" href={result[0]}>{result[0]}</Url>
   </span>
}];

class LoggerRaw extends Component {

  constructor() {
    super();
    this.fifo = [];
    this.state = {
      log: this.fifo,
      filter: null
    };
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
        <LoggerContainer>
          <InputContainer>
            <InputGroup
                onChange={(event) => this.setState({
                  filter: event.target.value === '' ? null : event.target.value
                })}
                value={this.state.filter === null ? '' : this.state.filter}
                placeholder="filter logs"
                type="text"
              />
          </InputContainer>
          <ScrollView>
            <LogContainer>
              {this.state.log
                .filter(item => this.state.filter === null ? true : item.includes(this.state.filter))
                .map((item, idx) => <CustomLine key={idx} ref={(el) => { this.messagesEnd = el; }} str={item}/>)}
            </LogContainer>
          </ScrollView>
        </LoggerContainer>
    );
  }
}


export default compose(
  withApiId
)(LoggerRaw);
