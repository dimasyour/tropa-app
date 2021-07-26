import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { Panel, PanelHeader, Header, Button, Group, Cell, Avatar, RichCell } from '@vkontakte/vkui';
import { timeToDate, timeFormat, getDate } from '../utils/func';

import logo from '../img/logo.jpg'

import bridge from '@vkontakte/vk-bridge'
import { access_token } from '../config'

const Home = inject('store')(observer(({ id, store }) => {
	const [ timerValue, updateTimerValue ] = useState(store.teamContest ? timeToDate(new Date(store.teamContest.date)).s : 0)
	const timerHTML = <div>{timerValue ? timeFormat('dd дн. hh:mm:ss', timerValue) : ''}</div>
	useEffect(() => {
		const interval = setInterval(() => {
			if(timerValue == 0){
				clearInterval(interval)
				return
			}
			updateTimerValue(timerValue - 1)
		}, 1000)
		return () => {
			clearInterval(interval)
		}
	}, [timerValue])
	return (
	<Panel id={id}>
		<PanelHeader>Тропа первака</PanelHeader>
		{store.vk_u &&
		<Group>
			<Cell
				before={store.vk_u.photo_200 ? <Avatar src={store.vk_u.photo_200}/> : null}
				description={store.userRole}
			>
				{`${store.vk_u.first_name} ${store.vk_u.last_name}`}
			</Cell>
		</Group>}
		{store.appUser.team && <Group header={<Header mode="secondary">Ваша тропа</Header>}>
			{store.teamContest && <RichCell
			key={store.teamContest._id}
			before={<Avatar size={48} src={logo}/>}
			caption={getDate(store.teamContest.date)}
			after={timerHTML}>
				{store.teamContest.name}
			</RichCell>}
		</Group>
		}
		
		{store.appUser.role < 3 && store.activeContest && store.activeContest?.institute != store.appUser.team?.institute && <Group header={<Header mode="secondary">Активная тропа</Header>}>
			<RichCell
			key={store.activeContest._id}
			before={<Avatar size={48} src={logo}/>}>
				{store.activeContest.name}
			</RichCell>
		</Group>
		}
	</Panel>
)}));

export default Home;
