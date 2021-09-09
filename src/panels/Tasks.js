import React, {useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { inject, observer } from 'mobx-react'
import axios from 'axios';

import { Panel, PanelHeader, PanelHeaderClose, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, Header, SimpleCell, Cell, Avatar, InfoRow } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Back, Icon24Dismiss } from '@vkontakte/icons'
import { serverURL } from '../config';
import { timeFormat, timeToDate } from '../utils/func'
import TeamAvatar from './components/TeamAvatar';

const Tasks = inject('store')(observer(({ id, store }) => {
	const osName = usePlatform()
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [points, setPoints] = useState([])
	const [activeModal, setActiveModal] = useState({modal: null, point: null })
	const [tasks, setTasks] = useState([])
	const [snackbar, setSnackbar] = useState(null)
	const pointsRef = React.useRef()

	const getTeamsOnPoint = (num) => {
		return store.orgTeams.filter(team => team.stage >= num).sort((a, b) => a.stage - b.stage)
	}

	pointsRef.current = points
	useEffect(() => {
		
	}, [activeModal])

	useLayoutEffect(() => {

	}, [tasks])

	

	
	

	const modal = (<ModalRoot activeModal={activeModal.modal}>
		<ModalPage
		id="point_info"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, {modal: null, point: null})}
		header={<ModalPageHeader
			right={osName === IOS && <PanelHeaderButton onClick={setActiveModal.bind(this, {modal: null, point: null})}><Icon24Dismiss/></PanelHeaderButton>}
			left={isMobile && osName === ANDROID && <PanelHeaderClose onClick={setActiveModal.bind(this, {modal: null, point: null})}/>}
		  >
			{activeModal.point ? activeModal.point.title : null}
		  </ModalPageHeader>} >
			<Group>
				<SimpleCell>
					<InfoRow header="Название">
						{activeModal.point?.title}
					</InfoRow>
				</SimpleCell>
				<SimpleCell>
					<InfoRow header="Локация">
						{activeModal.point?.location}
					</InfoRow>
				</SimpleCell>
				<SimpleCell>
					<InfoRow header="Задание">
						{activeModal.point?.task.title}
					</InfoRow>
				</SimpleCell>
				{store.activeContest && <>
				<Header mode="secondary">Команды на точке</Header>
					{getTeamsOnPoint(activeModal.point?.num).map(team => {
						let index = (activeModal.point?.num - 1) * 2
						return (<Cell
						before={<TeamAvatar team={team}/>}
						after={team.stage != activeModal.point?.num ? timeFormat('mm:ss' , timeToDate(new Date(team.timings[index]), new Date(team.timings[index+1]))) :  team.timings[index] ? `на точке с ${new Date(team.timings[index]).getHours()}:${new Date(team.timings[index]).getMinutes()}` : 'решают загадку'}
						>
							{team.name}
						</Cell>)
					})}
				</>}
			</Group>
		</ModalPage>
	</ModalRoot>)
	useEffect(() => {
		axios(serverURL + 'points').then(res => {
			setPoints(res.data.points)
		}).then(() => {
			axios.get(serverURL + 'tasks').then(res => {
				setTasks(res.data.tasks)
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
				Цикл
			</PanelHeader>
			{points.error && <div>Возникла следующая ошибка: {points.err}</div>}
			{!pointsRef.current.error && pointsRef.current.map(point => (<RichCell
			key={point.num}
			text={point.task?.title ?? 'задание не указано'}
			caption={point.location}
			onClick={setActiveModal.bind(this, {modal: 'point_info', point})}>
				{point.title}
			</RichCell>))}
		</Panel>
		{snackbar}
	</View>
)}));

export default Tasks;
