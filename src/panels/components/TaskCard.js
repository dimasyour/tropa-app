import React from 'react';
import { Button } from '@vkontakte/vkui'
import '../css/taskcard.css';

import one from '../../img/tasks/1.jpg';


export default function NewsCard({ title, text, fileID, children }) {
    var image
    switch(fileID) {
        case 0:
            image = one
            break
        default:
            image = null;
            break
    }
    return (
        <div className="task-wraper">
            {image && <div className="image-wraper">
                 <img src={image}></img>
            </div>}
            <div className="task-content">
                <div className="task-title">{title}</div>
                <div className="task-text">{text}</div>
                {children}
            </div>
        </div>
    )
}