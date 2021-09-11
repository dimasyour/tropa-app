import React from 'react';
import './preloader.css'

const CustomPreloader = ({ color }) => {
    return (
        <div className="loader">
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
            <span style={{background: color}}></span>
        </div>
    );
}

export default CustomPreloader;
