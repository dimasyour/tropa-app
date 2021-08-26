import React, {useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import axios from 'axios';

import { Panel, PanelHeader, PanelHeaderClose, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, FormLayout, FormItem, CustomSelect, Input, Cell, Button, Switch, Snackbar, Avatar } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Back, Icon24Dismiss } from '@vkontakte/icons'
import { Icon20CheckCircleFillGreen } from '@vkontakte/icons';
import { Icon20CancelCircleFillRed } from '@vkontakte/icons';
import { serverURL } from '../config';
import { Icon16Done, Icon16ErrorCircle } from '@vkontakte/icons';

const Tasks = inject('store')(observer(({ id, store }) => {
	const osName = usePlatform()
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [points, setPoints] = useState([])
	const [activeModal, setActiveModal] = useState({modal: null, point: null })
	const [tasks, setTasks] = useState([])
	const [snackbar, setSnackbar] = useState(null)
	const pointsRef = React.useRef()


	pointsRef.current = points
	useEffect(() => {
		if(activeModal.point){
			setTitle(activeModal.point.title)
			setLocation(activeModal.point.location)
			setTask(activeModal.point.task)
			setNext(activeModal.point.next)
			setStatus(activeModal.point.active)
		}
	}, [activeModal])

	useLayoutEffect(() => {

	}, [tasks])

	const [status, setStatus] = useState(false)
	const [title, setTitle] = useState('')
	const [location, setLocation] = useState('')
	const [task, setTask] = useState('')
	const [next, setNext] = useState('')
	
	const onTitleUpdate = (e) =>{
		setTitle(e.target.value)
	}
	const onLocationUpdate = (e) => setLocation(e.target.value)
	const onChangeTask = (e) => setTask(e.target.value)
	const onChangeNext = (e) => setNext(e.target.value)
	const toggleActive = (e) => setStatus(!status)
	const updatePoint = () => {
		axios.get( serverURL + 'points/update', {
			params: {
				title, active: status, location, task, next,
				id: activeModal.point._id
			}
		}).then(data => {
			setActiveModal({modal: null, point: null })
			setPoints(data.data.points)
			setSnackbar(<Snackbar
				onClose={() => setSnackbar(null)}
				before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
				>
					Точка успешно обновлена
				</Snackbar>)
		})
		.catch(err => {
			setActiveModal({modal: null, point: null })
			setSnackbar(<Snackbar
				onClose={() => setSnackbar(null)}
				before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
			  >
				 {err.response?.data.text}
			  </Snackbar>)
		})
	}

	const modal = (<ModalRoot activeModal={activeModal.modal}>
		<ModalPage
		id="edit_point"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, {modal: null, point: null})}
		header={<ModalPageHeader
			right={osName === IOS && <PanelHeaderButton onClick={setActiveModal.bind(this, {modal: null, point: null})}><Icon24Dismiss/></PanelHeaderButton>}
			left={isMobile && osName === ANDROID && <PanelHeaderClose onClick={setActiveModal.bind(this, {modal: null, point: null})}/>}
		  >
			{activeModal.point ? activeModal.point.title : null}
		  </ModalPageHeader>} >
			<Group>
				<FormLayout>
					<Cell after={<Switch onChange={toggleActive} defaultChecked={status}/>}>Статус</Cell>
					<FormItem top="Название">
						<Input value={title} name="title" onChange={onTitleUpdate}/>
					</FormItem>
					<FormItem top="Локация">
						<Input value={location} name="location" onChange={onLocationUpdate}/>
					</FormItem>
					<FormItem top="Задание">
						{activeModal.point?.task ? 
						
						<Input value={activeModal.point.task.title} disabled/>
						:
						
						<CustomSelect 
							placeholder="Введи название задания"
							onChange={onChangeTask}
							filterFn={(value, option) => option.label.toLowerCase().includes(value.toLowerCase()) || option.description.toLowerCase().includes(value.toLowerCase())}
							options={tasks?.map(item => { return {label: item.title, value: item._id }})}
						>

						</CustomSelect> }
					</FormItem>
					<FormItem top="Следующая точка">
						{activeModal.point?.next ? 
						
						<Input value={activeModal.point.next.title} disabled/>
						
						: 
						
						<CustomSelect 
							placeholder="Введи название точки"
							onChange={onChangeNext}
							filterFn={(value, option) => option.label.toLowerCase().includes(value.toLowerCase()) || option.description.toLowerCase().includes(value.toLowerCase())}
							options={points?.filter(item => !item.next).map(item => { return { label: item.title, value: item._id}})}
						>
						</CustomSelect>}
					</FormItem>
					<FormItem>
						<Button stretched size="l" onClick={updatePoint}>Обновить</Button>
					</FormItem>
				</FormLayout>
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
				Задания-точки
			</PanelHeader>
			{points.error && <div>Возникла следующая ошибка: {points.err}</div>}
			{!pointsRef.current.error && pointsRef.current.map(point => (<RichCell
			key={point.num}
			text={point.task?.title ?? 'задание не указано'}
			caption={point.location}
			onClick={setActiveModal.bind(this, {modal: 'edit_point', point})}
			after={point.active ? <Icon20CheckCircleFillGreen/> : <Icon20CancelCircleFillRed/>}>
				{point.title}
			</RichCell>))}
		</Panel>
		{snackbar}
	</View>
)}));

export default Tasks;
