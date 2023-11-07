import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import grade from './grades/reducers';
import enrollment from './enrollment/reducers';
import authReducer from './auth/reducer';

import { commonReducer } from './common/reducer';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

const reducer = combineReducers({
	grade,
	enrollment,
	authReducer,
	common: commonReducer
});

export type ReduxState = ReturnType<typeof reducer>;

export const useReduxSelector: TypedUseSelectorHook<ReduxState> = useSelector;

const composeEnhancers =
	(window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export default createStore(reducer, composeEnhancers(applyMiddleware(thunkMiddleware)));
