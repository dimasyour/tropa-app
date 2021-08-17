import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import axios from 'axios';
import { serverURL } from '../config'
import './css/way.css';

import { Panel, Text, Separator, Div, Button, Title } from '@vkontakte/vkui';

const Way = inject('store')(observer(({ id, store }) => {
    const [ tasks, setPoints ] = useState([])
    useEffect(() =>{
        store.togglePopout()
        axios(serverURL + 'points').then(res => {
			setPoints(res.data.points)
            store.togglePopout()
		})
		.catch((err) => {
			setPoints({error: err.message})
            store.togglePopout()
		})
    }, [])
	return (
        <div class="way-container">
            {tasks.map(task => (
                 <div class="item item--disabled">
                 <div class="item__point"></div>
                 <div class="item__name"> {task.location}</div>
             </div>
            ))}
        </div>
    )}));

export default Way;
