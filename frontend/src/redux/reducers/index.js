import { combineReducers } from "redux";
import catalog from "./catalog";
import filter from "./filter";
import classDescription from "./classDescription";
import grade from "./grade";
import enrollment from "./enrollment"


export default combineReducers({ catalog, filter, classDescription, grade, enrollment });
