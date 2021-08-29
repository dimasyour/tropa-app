import React, {useEffect} from 'react';

import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import Logo from '../icons/Logo'
// import './css/hello.css'

import { Panel, Text, Separator, Div, Button, Title, PanelHeader } from '@vkontakte/vkui';

const Start = inject('store')(observer(({ id, store, theme }) => {
	useEffect(() =>{
		bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#4BB34B"});
		return () => bridge.send("VKWebAppSetViewSettings",  theme == "client_light" ? {"status_bar_style": 'light', "status_bar_color": "#191919"} : {"status_bar_style": 'dark', "status_bar_color": "#f0f0f0"} );
	}, [])
	return (<Panel id={id}>
		{/* <PanelHeader separator={false} style={{color: 'white'}}>Тропа первака 2021 </PanelHeader> */}
		<Div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 0}}>
			<Div style={{flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#4BB34B', paddingTop: '56px'}}>
				<Title level="1" weight="heavy" style={{ marginBottom: 53, marginTop: 30, textAlign: 'center', color: 'white' }}>Добро пожаловать на игру</Title>
				{/* <Text weight="regular" style={{ marginBottom: 16, textAlign: 'center' }}>Приветствуем вас в приложении увлекательной игры</Text> */}
				<Logo />
			</Div>
			<div style={{ borderBottomRightRadius: "50%", borderBottomLeftRadius: "50%", background: '#4BB34B', height: 80	}}></div>
			<Div style={{flex: 2}}>
				<Button size="l" stretched style={{marginTop: 8}} onClick={store.goPage.bind(this, "reg")}>Создать команду</Button>
				<Separator/>
				<Button size="l" stretched style={{marginTop: 8}} mode="secondary" onClick={store.goPage.bind(this, "home")}>Продолжить без регистрации</Button>
			</Div>
		</Div>
	</Panel>
)}));

export default Start;
