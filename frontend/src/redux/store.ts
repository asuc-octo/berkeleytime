import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import grade from './reducers/grade';
import enrollment from './reducers/enrollment';
import authReducer from './auth/reducer';

import { commonReducer } from './common/reducer';

const reducer = combineReducers({
	grade,
	enrollment,
	authReducer,
	common: commonReducer
});

export type ReduxState = ReturnType<typeof reducer>;

const composeEnhancers =
	(window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export default createStore(reducer, composeEnhancers(applyMiddleware(thunkMiddleware)));
