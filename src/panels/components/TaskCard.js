import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group'
import { Button } from '@vkontakte/vkui'
import '../css/taskcard.css';
import ReactPlayer from 'react-player/lazy'

import one from '../../img/tasks/1.png';
import two from '../../img/tasks/2.jpg';
import three from '../../img/tasks/3.png';
import four from '../../img/tasks/4.png';
import five from '../../img/tasks/5.jpg';
import { Icon48WritebarDone } from '@vkontakte/icons';


export default function NewsCard({ title, text, file, children, isComplete, isFailure }) {
    var image, video
    const [placeholder, setPlaceholder] = useState(!title)
    if(file){
        if(file.type == 'video'){
            video = file.value
            image = null
        } else if(file.type == 'image'){
            switch(file.value) {
                case 0:
                    image = one
                    break
                case 1:
                    image = two
                    break
                case 2:
                    image = three
                    break
                case 3:
                    image = four
                    break
                case 4:
                    image = five
                    break
                default:
                    image = null;
                    break
            }
            video = null
        }
    }
    
    useEffect(() => {
        if(file){
            if(file.type == 'video'){
                video = file.value
                image = null
            } else if(file.type == 'image'){
                switch(file.value) {
                    case 0:
                        image = one
                        break
                    case 1:
                        image = two
                        break
                    case 2:
                        image = three
                        break
                    case 3:
                        image = four
                        break
                    case 4:
                        image = five
                        break
                    default:
                        image = null;
                        break
                }
                video = null
            }
        }
        
    }, [file])

    useEffect(() => {
        setPlaceholder(!title)
    }, [title])
    return (
        <div className="task-wraper">
            {image && <div className="image-wraper">
                 <img src={image}></img>
            </div>}
            {video && <div className="image-wraper">
                    <ReactPlayer url={video} width="100%"/>
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