import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import axios from 'axios';

import { Panel, PanelHeader, PanelHeaderClose, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Back, Icon24Dismiss } from '@vkontakte/icons'
import { Icon20CheckCircleFillGreen } from '@vkontakte/icons';
import { Icon20CancelCircleFillRed } from '@vkontakte/icons';
import { serverURL } from '../config';

const Tasks = inject('store')(observer(({ id, store }) => {
	const osName = usePlatform()
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [points, setPoints] = useState([])
	const [activeModal, setActiveModal] = useState({modal: null, point: null})
	const [tasks, setTasks] = useState([])

	const modal = (<ModalRoot activeModal={activeModal.modal}>
		<ModalPage
		id="edit_point"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			right={osName === IOS && <PanelHeaderButton onClick={setActiveModal.bind(this, {modal: null, point: null})}><Icon24Dismiss/></PanelHeaderButton>}
			left={isMobile && osName === ANDROID && <PanelHeaderClose onClick={setActiveModal.bind(this, {modal: null, point: null})}/>}
		  >
			{activeModal.point ? activeModal.point.title : null}
		  </ModalPageHeader>} >
			<Group>
				{JSON.stringify(activeModal.point)}
			</Group>
		</ModalPage>
	</ModalRoot>)
	useEffect(() => {
		store.togglePopout()
		axios(serverURL + 'points').then(res => {
			setPoints(res.data.points)
		}).then(() => {
			axios.get(serverURL + 'tasks').then(res => {
				store.togglePopout()
				setTasks(res.tasks)
			})
		})
		.catch((err) => {
			setPoints({error: err.message})
		})
	}, [])
	return (
	<View id="tasks" activePanel="tasks" popout={store.popout} modal={modal}>
		<Panel id={id}>
			<PanelHeader left={<PanelHeaderButton onClick={() => window.history.back()}>
				{osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
			</PanelHeaderButton>}> 
				Задания-точки
			</PanelHeader>
			{points.error && <div>Возникла следующая ошибка: {points.err}</div>}
			{!points.error && points.map(point => (<RichCell
			text={point.task ?? 'задание не указано'}
			caption={point.location}
			onClick={setActiveModal.bind(this, {modal: 'edit_point', point})}
			after={point.active ? <Icon20CheckCircleFillGreen/> : <Icon20CancelCircleFillRed/>}>
				{point.title}
			</RichCell>))}
		</Panel>
	</View>
)}));

export default Tasks;
