import {withProps, compose, withHandlers, withState} from "recompose";
const randomWords = require('random-words');

export default compose(
  withState('apiId', '_setApiId', () => {
    let apiId;

    try {
      if (window.location.pathname === '/') {
        apiId = /^\?([a-z-]+)$/.exec(window.location.search)[1];
      }
    } catch (e) {
    }

    if (!apiId) {
      apiId = generateRandomApiId();
      window.history.pushState(null, null, window.location.protocol + '//' + window.location.host + '/?' + apiId);
    }

    return apiId;
  }),
  withHandlers({
    updateApiId: ({apiId}) => (newApiId) => {
      window.location.href = window.location.href.replace(apiId, newApiId);
    }
  })
);

export const generateRandomApiId = () => randomWords({ exactly: 3, join: '-'});