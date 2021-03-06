import React, {useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { inject, observer } from 'mobx-react'
import axios from 'axios';

import { Panel, PanelHeader, PanelHeaderClose, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, Header, SimpleCell, Cell, MiniInfoCell, InfoRow, Avatar } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Back, Icon24Dismiss, Icon20ArticleBoxOutline } from '@vkontakte/icons'
import { serverURL, access_token } from '../config';
import { timeFormat, timeToDate } from '../utils/func'
import TeamAvatar from './components/TeamAvatar';
import bridge from '@vkontakte/vk-bridge'

const Tasks = inject('store')(observer(({ id, store }) => {
	const osName = usePlatform()
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [points, setPoints] = useState([])
	const [activeModal, setActiveModal] = useState({modal: null, point: null })
	const [tasks, setTasks] = useState([])
	const [snackbar, setSnackbar] = useState(null)
	const [org, setOrg] = useState(null)
	const pointsRef = React.useRef()

	const getTeamsOnPoint = (num) => {
		return store.orgTeams.filter(team => team.stage >= num).sort((a, b) => a.stage - b.stage)
	}

	pointsRef.current = points
	useEffect(() => {
		if(activeModal.modal){
			store.socket.emit('admin:get_point_org', { point: activeModal.point._id })
			store.socket.on('admin:get_point_org', data => {
				if(data.org){
					const { uid } = data.org
					bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": uid, "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
						setOrg({ photo: d.response[0].photo_200, username: d.response[0].first_name + ' ' + d.response[0].last_name})
					})
				}
			})
		}
	}, [activeModal])

	useLayoutEffect(() => {

	}, [tasks])

	

	
	

	const modal = (<ModalRoot activeModal={activeModal.modal}>
		<ModalPage
		id="point_info"
		settlingHeight={100}
		onClose={() => { setActiveModal({modal: null, point: null}); setOrg(null) } }
		header={<ModalPageHeader
			right={osName === IOS && <PanelHeaderButton onClick={() => { setActiveModal({modal: null, point: null}); setOrg(null) } }><Icon24Dismiss/></PanelHeaderButton>}
			left={isMobile && osName === ANDROID && <PanelHeaderClose onClick={() => { setActiveModal({modal: null, point: null}); setOrg(null) } }/>}
		  >
			{activeModal.point ? activeModal.point.title : null}
		  </ModalPageHeader>} >
			<Group>
				<SimpleCell>
					<InfoRow header="????????????????">
						{activeModal.point?.title}
					</InfoRow>
				</SimpleCell>
				<SimpleCell>
					<InfoRow header="??????????????">
						{activeModal.point?.location}
					</InfoRow>
				</SimpleCell>
				<SimpleCell>
					<InfoRow header="??????????????">
						{activeModal.point?.task.title}
					</InfoRow>
				</SimpleCell>
				<SimpleCell>
					<InfoRow header="??????????????">
					{activeModal.point?.task.pointTaskTitle}
					</InfoRow>
				</SimpleCell>
				{org && <SimpleCell before={<Avatar src={org.photo}/>}>
					<InfoRow header="??????????????????????">
						{org.username}
					</InfoRow>
				</SimpleCell>}
				<MiniInfoCell
					before={<Icon20ArticleBoxOutline />}
					textWrap="full"
					textLevel="primary"
					>
					{activeModal.point?.task.description.task}
					</MiniInfoCell>
				{store.activeContest && <>
				<Header mode="secondary">?????????????? ???? ??????????</Header>
					{getTeamsOnPoint(activeModal.point?.num).map(team => {
						let index = (activeModal.point?.num - 1) * 2
						return (<Cell
						before={<TeamAvatar team={team}/>}
						after={team.stage != activeModal.point?.num ? timeFormat('mm:ss' , timeToDate(new Date(team.timings[index]), new Date(team.timings[index+1]))) :  team.timings[index] ? `???? ?????????? ?? ${new Date(team.timings[index]).getHours()}:${new Date(team.timings[index]).getMinutes()}` : '???????????? ??????????????'}
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
				????????
			</PanelHeader>
			{points.error && <div>???????????????? ?????????????????? ????????????: {points.err}</div>}
			{!pointsRef.current.error && pointsRef.current.map(point => (<RichCell
			key={point.num}
			text={point.task?.title ?? '?????????????? ???? ??????????????'}
			caption={point.location}
			onClick={setActiveModal.bind(this, {modal: 'point_info', point})}>
				{point.title}
			</RichCell>))}
		</Panel>
		{snackbar}
	</View>
)}));

export default Tasks;
