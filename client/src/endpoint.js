import React  from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';
import {Button, ControlGroup} from "@blueprintjs/core";

const style = {
  container: {
    margin: '10px 10px 0px 10px'
  },
  code: {
    margin: '5px 0px 10px 2px'
  }
};

export const Endpoint = ({code, method, baseUrl, onCodeChange, onMethodChange, onBaseUrlChange, onDelete}) => {
  return (
      <div className="endpoint" style={style.container}>
        <ControlGroup fill={false} vertical={false}>
          <div className="bp3-select" style={style.endpointRow}>
            <select value={method} onChange={onMethodChange}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="bp3-input-group .modifier" style={style.endpointRow}>
            <span className="bp3-icon bp3-icon-globe"></span>
            <input onChange={onBaseUrlChange} type="text" className="bp3-input" placeholder="base url" value={baseUrl} />
          </div>

          <Button style={style.endpointRow} icon="trash" intent="danger" text="Delete" onClick={onDelete} />
        </ControlGroup>

        <div style={style.code}>
          <div className="ace_editor"><span style={{color: '#0000ff'}}>function</span> (db, params, {method !== 'GET' ? 'body,' : ''} console) {'{'}</div>
          <AceEditor
              style={{marginLeft: 10}}
              mode="javascript"
              theme="xcode"
              name="blah2"
              onChange={onCodeChange}
              fontSize={12}
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={false}
              value={code}
              width={'400px'}
              setOptions={{
                autoScrollEditorIntoView: true,
                maxLines: 30,
                minLines: 1,
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: false,
                tabSize: 2,
              }}/>
            <div className="ace_editor">}</div>
        </div>
      </div>
    );
};