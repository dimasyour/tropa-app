import React from 'react';
import { PopoutWrapper } from '@vkontakte/vkui'
import ReactPlayer from 'react-player';
import { Icon12Cancel } from '@vkontakte/icons';
import { serverURL } from '../../config'

const VideoPopout = ({ onClose }) => {
    return (
    <PopoutWrapper onClick={onClose} style={{position: 'relative'}}>
        <ReactPlayer url={`${serverURL}video/intro`} width="100%" controls={true} light={'https://leton.cc/image/preview'}/>
        <div onClick={onClose} style={{position: 'absolute', bottom: '100px', borderRadius: 6, backgroundColor: '#fff', padding: "5px 15px", display: 'flex', alignItems: 'center'}}>
            <Icon12Cancel style={{display: 'inline-block', marginRight: 10, color: "#262626"}} width={20} height={20}/> <span style={{color: "#262626"}}>ЗАКРЫТЬ</span>
        </div>
    </PopoutWrapper>
    );
}

export default VideoPopout;
