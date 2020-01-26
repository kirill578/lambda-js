import React  from 'react';

import { ControlGroup, Button } from "@blueprintjs/core";
import {Endpoint} from "./endpoint";
import {compose, withState, withHandlers, branch, renderNothing, lifecycle, withProps} from "recompose";
import * as uuid from "uuid";
import withApiId, {generateRandomApiId} from "./withApiId";
import styled from 'styled-components';

const PanelContainer = styled.div`
  margin: 10px
`;



export const EditorRaw = ({endpoints, onSave, onAdd, onDelete, onMethodChange, onCodeChange, onBaseUrlChange, onClone, apiUrl, onDownloadAccessLog}) => {
  return (
      <div>
        <PanelContainer>
          <div className="bp3-input-group .modifier .disabled" style={{marginBottom: '10px'}} >
            <input type="text" className="bp3-input" placeholder="base url" value={apiUrl} />
          </div>
          <ControlGroup fill={false} vertical={false}>
            <Button icon="cloud-upload" intent='PRIMARY' large='true' text="Save" onClick={onSave} />
            <Button icon="add" large='true' text="Add Endpoint" onClick={onAdd} />
            <Button icon="duplicate" large='true' text="Clone To New URL" onClick={onClone} />
            <Button icon="duplicate" large='true' text="Generate CSV Access Log Report" onClick={onDownloadAccessLog} />
          </ControlGroup>
        </PanelContainer>

        <div className="editor">
          {endpoints.map(item =>
              <Endpoint
                  code={item.code}
                  method={item.method}
                  baseUrl={item.baseUrl}
                  onMethodChange={(event) => onMethodChange(item, event.target.value)}
                  onCodeChange={(value) => onCodeChange(item, value)}
                  onBaseUrlChange={(event) => onBaseUrlChange(item, event.target.value)}
                  onDelete={() => onDelete(item)}
            />)}
        </div>
      </div>
    );
};

export const Editor = compose(
    withApiId,
    withState('endpoints', 'setEndpoints', null),
    withProps(({apiId}) => ({
      apiUrl: window.location.protocol + '//' + window.location.host + '/api/' + apiId
    })),
    lifecycle({
      async componentDidMount() {

        const response = await fetch(new Request('/config/' + this.props.apiId + '.json'));
        const json = await response.json();
        console.log(json);
        this.props.setEndpoints(json);
      }
    }),
    branch(({endpoints}) => !endpoints, renderNothing),
    withHandlers({
      onAdd: ({setEndpoints}) => () => setEndpoints(endpoints => [
        ...endpoints,
        {
          id: uuid(),
          baseUrl: '/',
          method: 'GET',
          code: `return "hello world";`
        }
      ]),
      onDelete: ({setEndpoints}) => (endpoint) => setEndpoints(endpoints =>
          endpoints.filter(item => item.id !== endpoint.id)),
      onMethodChange: ({setEndpoints}) => (endpoint, value) =>
          setEndpoints(endpoints => endpoints.map(mapped =>
              mapped.id === endpoint.id ? {...endpoint, method: value} : mapped)),
      onCodeChange: ({setEndpoints}) => (endpoint, value) =>
          setEndpoints(endpoints => endpoints.map(mapped =>
              mapped.id === endpoint.id ? {...endpoint, code: value} : mapped)),
      onBaseUrlChange: ({setEndpoints}) => (endpoint, value) =>
          setEndpoints(endpoints => endpoints.map(mapped =>
              mapped.id === endpoint.id ? {...endpoint, baseUrl: value} : mapped)),
      onDownloadAccessLog: ({apiId}) => () => {
          if (window.location.host.includes("localhost")) {
              window.location = `http://localhost:5000/access_log/${apiId}.csv`;
          } else {
              window.location = `/access_log/${apiId}.csv`;
          }
      },
      onSave: ({endpoints, apiId}) => async () => {
        await fetch('/config/' + apiId + '.json', {
          method: 'POST',
          body: JSON.stringify(endpoints),
          headers: {
            "Content-Type": "application/json"
          },
        })},
      onClone: ({endpoints, updateApiId}) => async () => {
        const apiId = generateRandomApiId();
        await fetch('/config/' + apiId + '.json', {
          method: 'POST',
          body: JSON.stringify(endpoints),
          headers: {
            "Content-Type": "application/json"
          },
        });
        updateApiId(apiId);
      }
    })
)(EditorRaw);