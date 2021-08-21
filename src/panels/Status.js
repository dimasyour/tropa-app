import React from 'react';
import './css/status.css'

const Status = ({ mode, children }) => {
    var cssClass
    switch(mode){
        case 'success':
            cssClass = 'status-success';
            break;
        case 'warning':
            cssClass = 'status-warning';
            break;
        case 'danger':
            cssClass = 'status-danger';
            break;
        default:
            cssClass = 'status-default';
            break;
    }
    return (
        <span className="ant-badge ant-badge-status ant-badge-not-a-wrapper">
            <span className={`ant-badge-status-dot ${ cssClass }`}></span>
            <span className="ant-badge-status-text">{ children }</span>
        </span>
    )
}

export default Status;
