import React from 'react';
import { PopoutWrapper } from '@vkontakte/vkui'
import QrReader from 'react-qr-reader'

const CustomPopout = ({ onClose, onScan, onError }) => {
    return (
    <PopoutWrapper onClick={onClose}>
        <QrReader
        onScan={onScan}
        onError={onError}
        facingMode={'environment'}
        style={{ width: '100%' }}
        />
    </PopoutWrapper>
    );
}

export default CustomPopout;
