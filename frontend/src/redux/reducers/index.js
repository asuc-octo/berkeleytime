import { combineReducers } from "redux";
import catalog from "./catalog";
import filter from "./filter";
import classDescription from "./classDescription";


export default combineReducers({ catalog, filter, classDescription });
