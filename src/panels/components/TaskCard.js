import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group'
import { Button } from '@vkontakte/vkui'
import '../css/taskcard.css';

import one from '../../img/tasks/1.jpg';
import { Icon48WritebarDone } from '@vkontakte/icons';


export default function NewsCard({ title, text, fileID, children, isComplete, isFailure }) {
    var image
    const [placeholder, setPlaceholder] = useState(!title)
    switch(fileID) {
        case 0:
            image = one
            break
        default:
            image = null;
            break
    }
    useEffect(() => {
        setPlaceholder(!title)
    }, [title])
    return (
        <div className="task-wraper">
            {image && <div className="image-wraper">
                 <img src={image}></img>
            </div>}
            {!placeholder ? <div className="task-content">
                <div className="task-title">{title}</div>
                <div className="task-text">{text}</div>
                {children}
            </div> : 
            <div className="task-content task-content-placeholder">
                <div className="task-title-placeholder"></div>
                <div className="task-text-placeholder"></div>
                <div className="task-text-placeholder" id="d2"></div>
                <div className="task-btn-placeholder"></div>
            </div>}
            {/* <CSSTransition
                in={isFailure} timeout={1000} classNames="task-status" classNames={{  enter: 'task-failure-enter', enterActive: 'task-failure-active-enter', enterDone: 'task-failure-enter-done', exit: 'task-failure-exit', exitActive: 'task-failure-exit-active', }}
            >
                <div className='task-status'>
                    Ошибочный ответ
                </div>
            </CSSTransition> */}
        </div>
    )
}