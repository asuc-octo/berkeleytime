import { combineReducers } from 'redux';
import catalog from './catalog';
import filter from './filter';
import classDescription from './classDescription';
import grade from './grade';
import enrollment from './enrollment';
import banner from './banner';

export default combineReducers({
  catalog, filter, classDescription, grade, enrollment, banner
});
