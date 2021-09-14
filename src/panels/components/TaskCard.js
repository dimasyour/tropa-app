import React, { useState, useEffect } from 'react';
import '../css/taskcard.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player/lazy'
import { serverURL } from '../../config'

import one from '../../img/tasks/1.png';
import two from '../../img/tasks/2.jpg';
import three from '../../img/tasks/3.png';
import four from '../../img/tasks/4.png';
import five from '../../img/tasks/5.jpg';

export default function NewsCard({ task, children, stage, info }) {
    const [placeholder, setPlaceholder] = useState(true)
    const [title, setTitle] = useState(<div className="task-title-placeholder"></div>)
    const [text, setText] = useState(<div className="task-text-placeholder"></div>)
    const images = [one, two, three, four, five]
    useEffect(() => {
        if(task){
            if(task.title){
                setPlaceholder(false)
            } else {
                setPlaceholder(true)
            }
            setTimeout(() => setTitle(task.title), 2000)
            setTimeout(() => setText(task.text), 2000)
            
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
                <ReactPlayer url={`${serverURL}video/?id=${task.task.static.value}`} width="100%" controls={true}/>
            </div>}
        {!placeholder ? <div className="task-content">
            <div className="task-title">{ !stage ? '???' : title}</div>
            <div className="task-text">{!stage ? task.task.text : text}</div>
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