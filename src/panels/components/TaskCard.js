import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group'
import { Button } from '@vkontakte/vkui'
import '../css/taskcard.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player/lazy'

import one from '../../img/tasks/1.png';
import two from '../../img/tasks/2.jpg';
import three from '../../img/tasks/3.png';
import four from '../../img/tasks/4.png';
import five from '../../img/tasks/5.jpg';
import { Icon48WritebarDone } from '@vkontakte/icons';


export default function NewsCard({ task, children, stage, info }) {
    const [placeholder, setPlaceholder] = useState(true)
    const images = [one, two, three, four, five]
    useEffect(() => {
        if(task){
            if(task.title){
                setPlaceholder(false)
            } else {
                setPlaceholder(true)
            }
        } else {
            setPlaceholder(true)
        }
        
    }, [task])
    return (
        task ? <div className="task-wraper">
        {task?.task?.static?.type == 'image' && !stage && <div className="image-wraper">
            <LazyLoadImage
                src={images[task.task.static.value]}
                placeholder={<span>Загружается...</span>}
            />
        </div>}
        {task?.task?.static?.type == 'video' && !stage && <div className="image-wraper">
                <ReactPlayer url={task.task.static.value} width="100%"/>
            </div>}
        {!placeholder ? <div className="task-content">
            <div className="task-title">{ stage ? task.title : '???'}</div>
            <div className="task-text">{!stage ? task.task.text : 'Не забудьте попросить QR у организатора'}</div>
            {children}
        </div> : 
        <div className="task-content task-content-placeholder">
            <div className="task-title-placeholder"></div>
            <div className="task-text-placeholder"></div>
            <div className="task-text-placeholder" id="d2"></div>
            <div className="task-btn-placeholder"></div>
        </div>}
    </div> : info ?  <div className="task-content">
            <div className="task-title">{ info.title }</div>
            <div className="task-text">{ info.text }</div>
            {children}
        </div> : <div className="task-content task-content-placeholder">
            <div className="task-title-placeholder"></div>
            <div className="task-text-placeholder"></div>
            <div className="task-text-placeholder" id="d2"></div>
            <div className="task-btn-placeholder"></div>
        </div>
    )
}