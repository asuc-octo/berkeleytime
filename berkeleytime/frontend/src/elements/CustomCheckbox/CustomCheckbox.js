import React, { Component } from 'react';

class CustomCheckbox extends Component {
    constructor(props){
        super(props);
            this.state = {
                is_checked: (props.isChecked ? true:false)
            };
    }
    render() {
        const { isChecked, number, label, inline,...rest } = this.props;
        const classes = inline !== undefined ? "checkbox checkbox-inline":"checkbox";
        return (
            <div className={classes}>
                <input id={number} type="checkbox" checked={isChecked} {...rest}/>
                <label htmlFor={number}>{label}
                </label>
            </div>
        );
    }
}

export default CustomCheckbox;
