import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Panel, Text, Separator, Div, Button, Title } from '@vkontakte/vkui';

const Start = inject('store')(observer(({ id, store }) => {
	return (<Panel id={id}>
		<Div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
			<Div style={{flex: 3}}>
				<Title level="1" weight="heavy" style={{ marginBottom: 16, textAlign: 'center' }}>Тропа первака 2021</Title>
				<Text weight="regular" style={{ marginBottom: 16, textAlign: 'center' }}>Приветствуем вас в приложении увлекательной игры</Text>
			</Div>
			<Div style={{flex: 2}}>
				<Button size="l" stretched style={{margin: 8}} onClick={store.goPage.bind(this, "reg")}>Создать команду</Button>
				<Separator/>
				<Button size="l" stretched style={{margin: 8}} mode="secondary" onClick={store.goPage.bind(this, "home")}>Продолжить без регистрации</Button>
			</Div>
		</Div>
	</Panel>
)}));

export default Start;
