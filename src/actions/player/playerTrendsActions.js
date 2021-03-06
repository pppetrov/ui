/* global API_HOST */
import fetch from 'isomorphic-fetch';
import {
  getUrl,
} from 'actions/utility';

const url = playerId => `/api/players/${playerId}/matches`;

const REQUEST = 'playerTrends/REQUEST';
const OK = 'playerTrends/OK';
const ERROR = 'playerTrends/ERROR';

export const playerTrendsActions = {
  REQUEST,
  OK,
  ERROR,
};

export const getPlayerTrendsRequest = id => ({
  type: REQUEST,
  id,
});

export const getPlayerTrendsOk = (payload, id) => ({
  type: OK,
  payload,
  id,
});

export const getPlayerTrendsError = (payload, id) => ({
  type: ERROR,
  payload,
  id,
});

export const getPlayerTrends = (playerId, options = {}, fieldName) => (dispatch) => {
  dispatch(getPlayerTrendsRequest(playerId));
  return fetch(`${API_HOST}${getUrl(playerId, options, url)}`)
    .then(response => response.json())
    .then((response) => {
      const matches = response.filter(match => match[fieldName] !== undefined && match[fieldName] !== null)
      .reverse();

      const cumulativeSums = matches.reduce((cumulativeList, match, index) => {
        if (cumulativeList.length > 0) {
          const prevTotal = cumulativeList[index - 1];
          cumulativeList.push(prevTotal + match[fieldName]);
        } else {
          cumulativeList.push(match[fieldName]);
        }
        return cumulativeList;
      }, []);

      return cumulativeSums.map((value, index) => ({
        x: index + 1,
        value: Number((value / (index + 1)).toFixed(2)),
        match_id: matches[index].match_id,
        hero_id: matches[index].hero_id,
      }));
    })
    .then(json => dispatch(getPlayerTrendsOk(json, playerId)))
    .catch(error => dispatch(getPlayerTrendsError(error, playerId)));
};
