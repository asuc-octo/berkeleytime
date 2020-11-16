import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import catalog from './reducers/catalog';
import filter from './reducers/filter';
import classDescription from './reducers/classDescription';
import grade from './reducers/grade';
import enrollment from './reducers/enrollment';
import authReducer from './auth/reducer';

import { commonReducer } from './common/reducer'
// import { enrollmentReducer } from './enrollment/reducer';

const reducer = combineReducers({
  catalog, filter, classDescription, grade, enrollment, authReducer,
  
  common: commonReducer,
  // enrollment: enrollmentReducer,
});

export type ReduxState = ReturnType<typeof reducer>

export const composeEnhancers =
  (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export default createStore(reducer, composeEnhancers(applyMiddleware(thunkMiddleware)));
