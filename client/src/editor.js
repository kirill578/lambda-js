import React  from 'react';

import { ControlGroup, Button, InputGroup } from "@blueprintjs/core";
import {Endpoint} from "./endpoint";
import {compose, withState, withHandlers, branch, renderNothing, lifecycle, withProps} from "recompose";
import * as uuid from "uuid";
import withApiId, {generateRandomApiId} from "./withApiId";
import styled from 'styled-components';

const PanelContainer = styled.div`
  margin: 10px
`;



export const EditorRaw = ({endpoints, onSave, onAdd, onDelete, onMethodChange, onCodeChange, onBaseUrlChange, onClone, apiUrl, onDownloadAccessLog, onPasswordChange, password}) => {
  return (
      <div>
        <PanelContainer>
          <div className="bp3-input-group .modifier .disabled" style={{marginBottom: '10px'}} >
            <input type="text" className="bp3-input" placeholder="base url" value={apiUrl} />
          </div>
          <ControlGroup fill={false} vertical={false}>
            <Button icon="cloud-upload" intent='PRIMARY' large='true' text="Save And Deploy" onClick={onSave} />
            <InputGroup
              disabled={password === null}
              large='true'
              onChange={(event) => onPasswordChange(event.target.value)}
              value={password === null ? '' : password}
              placeholder="Password"
              type="text"
            />
            { password !== null ?
              <Button icon="unlock" large='true' text="Remove Password" intent='warning' onClick={() => onPasswordChange(null)} />
              :
              <Button icon="lock" large='true' text="Set Password" onClick={() => onPasswordChange('')} />
            }
          </ControlGroup>
          <ControlGroup fill={false} vertical={false} style={{marginTop: '10px'}} >
            <Button icon="add" text="Add Endpoint" onClick={onAdd} />
            <Button icon="duplicate" text="Clone To New URL" onClick={onClone} />
            <Button icon="duplicate" text="Generate CSV Access Log Report" onClick={onDownloadAccessLog} />
          </ControlGroup>
        </PanelContainer>

        <div className="editor">
          {endpoints.map((item, index) =>
              <Endpoint
                  key={index}
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

const getStoredPasswordByApiId = (apiId) => {
  const pwd = window.localStorage['password_' + apiId];
  if (pwd === undefined) {
    return null;
  } else {
    return pwd;
  }
}
const storedPasswordByApiId = (apiId, password) => window.localStorage['password_' + apiId] = password;
const deletePasswordByApiId = (apiId) => window.localStorage.removeItem('password_' + apiId);

export const Editor = compose(
    withApiId,
    withState('password', 'setPassword', ({apiId}) => getStoredPasswordByApiId(apiId)),
    withState('endpoints', 'setEndpoints', null),
    withProps(({apiId}) => ({
      apiUrl: window.location.protocol + '//' + window.location.host + '/api/' + apiId
    })),
    lifecycle({
      async componentDidMount() {
        const currentPassword = getStoredPasswordByApiId(this.props.apiId);
        const response = await fetch(new Request('/config/' + this.props.apiId + '.json', {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            'instance-password': currentPassword,
          },
        }));
        if (response.status === 403) {
          const pwd = prompt("This backend instance requires a password, please enter it", "");
          if (pwd != null) {
            if (pwd === '') {
              deletePasswordByApiId(this.props.apiId);
            } else {
              storedPasswordByApiId(this.props.apiId, pwd);
            }
            window.location.reload();
          }
        } else {
          const json = await response.json();
          this.props.setEndpoints(json);
        }
      }
    }),
    branch(({endpoints}) => !endpoints, renderNothing),
    withHandlers({
      onPasswordChange: ({setPassword}) => (text) => setPassword(text),
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
      onSave: ({endpoints, apiId, password}) => async () => {
        const currentPassword = getStoredPasswordByApiId(apiId);
        let newPasswordHeaders = {};
        if (currentPassword !== password) {
          if (password === null) {
            newPasswordHeaders = {
              'delete-password': 'true'
            }
          } else {
            newPasswordHeaders = {
              'new-password': password
            }
          }
        }
        const response = await fetch('/config/' + apiId + '.json', {
          method: 'POST',
          body: JSON.stringify(endpoints),
          headers: {
            "Content-Type": "application/json",
            'instance-password': currentPassword,
            ...newPasswordHeaders
          },
        });

        if (response.status === 200) {
            if (password === null) {
              deletePasswordByApiId(apiId)
            } else {
              storedPasswordByApiId(apiId, password)
            }
        }
      },
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