import React, { useState, useEffect, Fragment, useRef } from 'react';
import { inject, observer } from 'mobx-react'
import { Panel, Avatar, Header, PanelHeader, Tabs, TabsItem, Snackbar, ModalCard, Counter, FormItem, Div, Placeholder, Button, Cell, Switch, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, Caption, Link, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, FormLayout, Radio, Input, Text } from '@vkontakte/vkui';
import { timeToDate, timeFormat, getDate, declOfNum } from '../utils/func';
import { Icon16ErrorCircleOutline } from '@vkontakte/icons';
import { Icon16Done, Icon16ErrorCircle, Icon24Cancel, Icon24Done, Icon24BrainOutline, Icon24ScanViewfinderOutline, Icon28Flash, Icon16Chevron, Icon28Notifications, Icon28RefreshOutline, Icon16ErrorCircleFill } from '@vkontakte/icons';
import { Icon12OnlineVkmobile } from '@vkontakte/icons';
import Logo from '../icons/Logo'

import Way from './Way';
import Labirint from '../icons/Labirint'
import TaskCard from './components/TaskCard'
import QRCode from 'react-qr-code'

import bridge from '@vkontakte/vk-bridge'
import axios from 'axios';
import ReactPlayer from 'react-player';

const Home = inject('store')(observer(({ id, store }) => {
	const platform = usePlatform()
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [ activeModal, setActiveModal ] = useState(null)
	const [ snackbar, setSnackbar ] = useState(null)
	const [ teams, setTeams ] = useState([])

	const [ rateTeam, setRateTeam ] = useState(null)

	const [ idRate, setIdRate ] = useState(null)
	const [ comment, setComment ] = useState('')
	const [ answer, setAnswer ] = useState('')
	const [ rate, setRate ] = useState(0)
	const [ showFailure, setShowFailure ] = useState(false)
	const [ showComplete, setShowComplete ] = useState(false)
	const [ selectedTab, setSelectedTab ] = useState('rules')
	const [ moders, setModers ] = useState([])

	const sortedByPoint = [ ...store.orgTeams ].sort((a,b) => b.stage - a.stage)
	const idRateRef = useRef()
	idRateRef.current = idRate

	const [ isShow, setIsShow ] = useState(false)

	const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']

	useEffect(() => {
		const startParams = new URLSearchParams(window.location.search)
		const allowed = startParams.get("vk_are_notifications_enabled")
		if(allowed == 0){
			setActiveModal('req_notify')
		}
	}, [])

	const requestNotify = () => {
		bridge.send("VKWebAppAllowNotifications").catch(err => {
			if(err.error_data.error_code == 4){
				console.log('deny')
			}
		});
	}
	if(store.socket){
		store.socket.on('team:started', () => {
			setActiveModal(null)
		})
		store.socket.on('team:finished', () => {
			console.log('finished')
			setActiveModal(null)
		})
		store.socket.on('org:get_moders', (data) => {
			// console.log('moders', data)
			// setModers(data.moders)
		})
	}
	const onAhtung = () => {
		setActiveModal('red_alert'); 
		store.socket.emit('org:get_moders')
	}
	const snackbarOk = text => {
		setSnackbar(<Snackbar
			onClose={() => setSnackbar(null)}
			before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
			>
				{text}
			</Snackbar>)
	}
	const snackbarErr = text => {
		setSnackbar(<Snackbar
			onClose={() => setSnackbar(null)}
			before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
		  >
			 {text}
		  </Snackbar>)
	}


	const readQR = () => {
		bridge.send("VKWebAppOpenCodeReader").then(res => {
			const { code_data } = res
			store.socket.emit('qrcode', {qrHash: code_data, stage: store.appUser.team.stage, team: store.appUser.team._id})
			store.socket.on('qrcode_response', data => {
				if(data.response == 20){
					store.getAppUser()
					return setActiveModal('endgame')
				}
				if(data.response){
					snackbarOk('Верный QR')
					store.getAppUser()
				} else {
					snackbarErr('QR не подходит')
				}
			})
		}).catch(err => {
			if(err.error_type == "client_error"){
				snackbarErr(err.error_data.error_reason)
			}
		})
	}
	const sendRate = () => {
		setActiveModal(null)
		store.socket.emit('org:new_rate', {
			team: rateTeam._id,
			point: store.appUser.point.title, 
			comment: comment,
			rate: rate,
			org: store.appUser._id
		})
		setSnackbar(snackbarOk('Оценка выставлена'))
	}
	const editRate = () => {
		setActiveModal(null)
		store.socket.emit('org:edit_rate', { 
			rate: rate,
			comment: comment,
			id: idRateRef.current._id,
		})
		snackbarOk('Оценка успешно изменена')
	}
	const onChangeComment = e => {
		setComment(e.target.value)
	}
	const sendNotify = () => {

	}
	const onChangeAnswer = e => setAnswer(e.target.value)
	const readyForStart = () => {
		setActiveModal(null)
		store.socket.emit('team:ready_start', {teamId: store.appUser.team._id})
	}
	const checkAnswer = e => {
		setActiveModal(null)
		store.socket.emit('check_ans', {
			ans: answer,
			team: store.appUser.team._id
		})
		store.socket.on('check_ans_server', data => {
			if(data.ans){
				snackbarOk('Правильный ответ!')
			} else {
				snackbarErr('Подумайте ещё')
			}
		})
		setAnswer('')
	}
	const toggleShow = () => setIsShow(!isShow)
	const modalRoot =  store.appUser.team ? (<ModalRoot activeModal={activeModal}>
		<ModalCard
          id="endgame"
          onClose={() => this.setActiveModal(null)}
          icon={<Icon28Flash />}
          header="Последняя точка"
          subheader="Это была ваша последняя точка, бегите на финиш!"
          actions={
            <Button size="l" mode="primary" onClick={setActiveModal.bind(this, null)}>
              Спасибо!
            </Button>
          }
        >

        </ModalCard>
		<ModalCard 
			id="req_notify"
			onClose={() => this.setActiveModal(null)}
			header="Ахтунг-уведомления"
			subheader="Тебя назначили модератором, а значит на тебя надеятся! Включи пожалуйста уведомления приложения, чтобы организаторы могли уведомить тебя о проблеме на точке"
			icon={<Icon28Notifications key="icon" />}
			actions={
				<Button size="l" mode="primary" onClick={() => { setActiveModal(null); requestNotify()}}>
				  Согласен
				</Button>
			  }
		>
			</ModalCard>
			<ModalCard 
			id="red_alert"
			onClose={() => this.setActiveModal(null)}
			header="Ахтунг-уведомление"
			subheader="Ты уверен, что тебе нужна помощь свободных организаторов?"
			icon={<Icon28Notifications key="icon" />}
			actions={
				<>
					<Button size="l" mode="primary" onClick={() => { setActiveModal(null); sendNotify()}}>
					ДА
					</Button>
					<Button size="l" mode="outline" onClick={() => { setActiveModal(null);}}>
					Обойдусь
					</Button>
			  	</>
			  }
		>

		</ModalCard>
		
		<ModalPage
		id="rules"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Напутствие
		  </ModalPageHeader>} >
		  	<Tabs>
					<TabsItem 
					selected={selectedTab == 'rules'}
					onClick={setSelectedTab.bind(this, 'rules')}
					>Правила</TabsItem>
					<TabsItem
					selected={selectedTab == 'start'}
					onClick={setSelectedTab.bind(this, 'start')}
					>Старт</TabsItem>
				</Tabs>
				{selectedTab == 'rules' && <FormItem>
					Правила забега
				</FormItem> }
				{selectedTab == 'start' && <FormItem>
				
				 {store.appUser.role == 1 ? <>
					<Caption level="2" weight="semibold" caps style={{ marginBottom: 16, marginLeft: 16 }}>Для начала забега вам необходимо получить разрешение организатора. Покажите ему этот код</Caption>
					<Div style={{background: "white", padding: '10px', width: 'fit-content', margin: '0 auto', borderRadius: "6px", textAlign: 'center'}}>
						<QRCode value={'start|'+store.appUser.team._id} />		
					</Div>

				 </> :  <Caption level="2" weight="semibold" caps style={{ marginBottom: 16 }}>У капитана вашей команды есть инструкция</Caption>}
			</FormItem>}
			
		</ModalPage>
		<ModalPage
		id="finish"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Финиш
		  </ModalPageHeader>} >
		  {store.appUser.role == 1 ? <>
					<Caption level="2" weight="semibold" caps style={{ marginBottom: 16, marginLeft: 16 }}>Покажите организатору этот код на финише</Caption>
					<Div style={{background: "white", padding: '10px', width: 'fit-content', margin: '0 auto', borderRadius: "6px", textAlign: 'center'}}>
						<QRCode value={'finish|'+store.appUser.team._id} />		
					</Div>

				 </> :  <Caption level="2" weight="semibold" caps style={{ marginBottom: 16 }}>У капитана вашей команды есть инструкция</Caption>}
			
		</ModalPage>
		<ModalPage
		id="rateTeam1"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, 'rateTeam2')}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={setActiveModal.bind(this, 'rateTeam2')}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Следующая точка
		  </ModalPageHeader>} >
			<Div style={{display: 'flex', justifyContent: "center", flexDirection: 'column', height: "100%"}}>
				<Div style={{textAlign: 'center'}}>
					QR-code для команды "{rateTeam?.name}" для следующей точки
				</Div>
				<Div style={{background: "white", padding: '10px', margin: '0 auto', borderRadius: "6px", textAlign: 'center'}} >
					{ store.hashNextPoint && <QRCode value={store.hashNextPoint} size={250}/> }
				</Div>
			</Div>
		</ModalPage>
		<ModalPage
		id="rateTeam2"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			{rateTeam?.name}
		  </ModalPageHeader>} >
			<Div style={{display: 'flex', justifyContent: "center", flexDirection: 'column', height: "100%"}}>
				<FormLayout>
					<FormItem top="Как вы оцениваете команду?">
						{[0,1,2,3,4,5,6,7,8,9,10].map(rate => (
							<Radio name="rate" onChange={setRate.bind(this, rate)}>{rate} {declOfNum(rate, ['балл', 'балла', 'баллов'])}</Radio>
						))}
            		</FormItem>
					<FormItem top="Комментарий">
						<Input name="comment" onChange={onChangeComment}/>
            		</FormItem>
					<FormItem>
						<Button size="l" stretched onClick={sendRate}>Оценить</Button>
					</FormItem>
				</FormLayout>
			</Div>
		</ModalPage>
		<ModalPage
		id="editRate"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			{rateTeam?.name}
		  </ModalPageHeader>} >
			<Div style={{display: 'flex', justifyContent: "center", flexDirection: 'column', height: "100%"}}>
				<FormLayout>
					<FormItem top="Как вы оцениваете команду?">
						{[0,1,2,3,4,5,6,7,8,9,10].map(rate => (
							<Radio name="rate" onChange={setRate.bind(this, rate)} disabled={idRateRef.current?.rate == rate}>{rate} {declOfNum(rate, ['балл', 'балла', 'баллов'])}{idRateRef.current?.rate == rate ? '(текущая)' : ''}</Radio>
						))}
            		</FormItem>
					<FormItem top="Старый комментарий">
						<Text>{idRateRef.current?.comment.length ? idRateRef?.current?.comment[idRateRef?.current?.comment.length - 1] : 'отсутствует'}</Text>
            		</FormItem>
					<FormItem top="Причина изменения">
						<Input name="comment" onChange={onChangeComment}/>
            		</FormItem>
					<FormItem>
						<Button size="l" stretched onClick={editRate}>Изменить</Button>
					</FormItem>
				</FormLayout>
			</Div>
		</ModalPage>
		<ModalPage
		id="way"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Маршрут
		  </ModalPageHeader>} >
			<Way/>
		</ModalPage>
		<ModalPage
		id="check_ans"
		// settlingHeight={50}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton disabled={!answer} onClick={checkAnswer}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton disabled={!answer} onClick={checkAnswer}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Проверка ответа
		  </ModalPageHeader>} >
			<FormLayout>
				<FormItem top="Ваш вариант ответа">
					<Input onChange={onChangeAnswer}/>
				</FormItem>
			</FormLayout>
		</ModalPage>
		
	</ModalRoot>) : null
	return (

		<View id="home" activePanel="home" modal={modalRoot}>
								<Panel id={id}>
		<PanelHeader >Тропа первака 2021  </PanelHeader>
	


		{store.vk_u &&
		<Group>

			<Cell
				before={store.vk_u.photo_200 ? <Avatar src={store.vk_u.photo_200}/> : null}
				description={store.userRole}
			>
				{`${store.vk_u.first_name} ${store.vk_u.last_name}`}
			</Cell>
		</Group>}

			{store.appUser.team ? 
			// С КОМАНДОЙ
			<>

			{ store.appUser.team && !store.appUser?.team.startAt && store.appUser.role < 2 && <Group header={<Header mode="secondary">Ваша тропа</Header>}>
						{store.teamContest && <RichCell
						key={store.teamContest._id}
						before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}
						caption={getDate(store.teamContest.date)}
						after={store.appUser.team.stage == 0 ? store.teamContest.status ? store.appUser.role == 1 ? store.appUser.status == 3 ? <Button mode="outline" onClick={setActiveModal.bind(this, 'rules')}>Начать забег</Button> : '' : '' : timeFormat('dd дн. hh ч.',store.secToTeamContest) : '-'}>
							{store.teamContest.name}
						</RichCell>}
					</Group>
					}
					{/* {store.appUser.team.start && store.appUser.team.currTask} */}
					{store.appUser.role < 3 && store.activeContest && store.activeContest?.institute != store.appUser.team?.institute && <Group header={<Header mode="secondary">Активная тропа</Header>}>
						<RichCell
						key={store.activeContest._id}
						before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}>
							{store.activeContest.name}
						</RichCell>
					</Group>
					}
			
			{store.appUser.role < 3 && store.activeContest && store.activeContest?.institute != store.appUser.team?.institute && <Group header={<Header mode="secondary">Активная тропа</Header>}>
				<RichCell
				key={store.activeContest._id}
				before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}>
					{store.activeContest.name}
				</RichCell>
			</Group>}

			{store.appUser.team && store.appUser.team.startAt && store.appUser.role < 3 && store.appUser.team.status != 5 && store.appUser?.team.stage != 20 && store.appUser?.team.stage != 21 && <Group header={<Header mode="secondary">Текущее задание</Header>}>

				{<TaskCard isComplete={showComplete} isFailure={showFailure} title={!store.appUser.team.substage ? '???' : store.currentTask?.title} text={!store.appUser.team.substage ? store.currentTask?.text : store.currentTask?.text2}  fileID={!store.appUser.team.substage ? store.currentTask?.task.static : null} >
					{!store.appUser.team.substage ? <Button before={<Icon24BrainOutline width={20} height={20}/>} mode="outline" onClick={setActiveModal.bind(this, 'check_ans')} stretched >Проверить ответ</Button> : <Button before={<Icon24ScanViewfinderOutline width={20} height={20}/>} mode="outline" onClick={readQR} stretched>Сканировать QR</Button>}
				</TaskCard>}
			</Group>}

			{store.appUser.team.status == 5 &&  <Placeholder
			icon={<Icon16ErrorCircleOutline width={70} height={70}/>}
			>
			Ваша команда дисквалифицирована
			</Placeholder>}

			{store.appUser.team && store.appUser?.team.stage == 20 && <div>
			<TaskCard title="Завершение забега" text="Вы большие молодцы. Вам остался один шаг до финиша">
				<Button mode="outline" before={<Icon12OnlineVkmobile/>} onClick={setActiveModal.bind(this, 'finish')} stretched>Задание</Button>
			</TaskCard>
			</div>}

			{store.appUser.team && store.appUser?.team.stage == 21 && <div>
				<Logo/>
				<div>
					Ваш забег завершён! Спасибо за участие! Ожидайте подведения итогов
				</div>
				<div>
					Ваше время: {timeFormat('hh ч. mm мин. ss с.', timeToDate(store.appUser.team?.finishAt, store.appUser.team?.startAt))}
				</div>
			</div>}

			</>
			:
			// БЕЗ КОМАНДЫ
			<>
			{store.appUser.role < 3 && store.activeContest && store.activeContest?.institute != store.appUser.team?.institute && <Group header={<Header mode="secondary">Активная тропа</Header>}>
				<RichCell
				key={store.activeContest._id}
				before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}>
					{store.activeContest.name}
				</RichCell>
			</Group>}
			
			</>
			}
			{store.appUser.role > 3 && store.activeContest && <Group header={<Header mode="secondary" aside={<Link onClick={() => {store.socket.emit('org:refresh_team');snackbarOk('Данные обновлены');}}><Icon28RefreshOutline width={20} height={20}/></Link>}>Положение команд</Header>}>
				{ 
				sortedByPoint.map(team => {
					const rate = team.rates.reduce((acc, rate) => acc + rate.rate, 0)
					return (<RichCell
				key={team._id}
				before={<Avatar style={{ background: team.color}}/>}
				text={team.stage ? `Точка ${team.stage+1}` : 'не стартовали'}
				after={rate + ' ' + declOfNum(rate , ['балл', 'балла', 'баллов'])}
				caption={team.substage ? 'на точке' : 'решают загадку'}>
					{team.name}
				</RichCell>)})
				}
			</Group> }


			{store.appUser.role == 3 && 
				<Group header={<Header mode="secondary" aside={<><Link style={{marginRight: 24}} onClick={onAhtung}><Icon16ErrorCircleFill width={16} height={16}/></Link><Link onClick={() => {store.socket.emit('org:refresh_team');snackbarOk('Данные обновлены');}}><Icon28RefreshOutline width={20} height={20}/></Link></>}>Команды-участницы</Header>}>
					<Cell disabled after={<Switch onClick={toggleShow}/>}>
						Отображать оценки
					</Cell>
				{
				store.orgTeams.map(team => {
					const leftTeam = team.rates.filter(rate => rate.org == store.appUser._id)
					let index = (store.appUser.point?.num - 1) * 2
					return (<RichCell
						onClick={team.stage >= store.appUser.point?.num && team.substage ? leftTeam.length ? () => {setActiveModal('editRate'); setRateTeam(team); setIdRate(leftTeam[0])} : () => { setActiveModal('rateTeam1'); setRateTeam(team)}: null}
						caption={`${institute[team.institute]}, гр.${team.group} ${team.timings[index] ? `, на задании точки с ${new Date(team.timings[index]).getHours()}:${new Date(team.timings[index]).getMinutes()}` : ''}`}
						before={<Avatar style={{background: team?.color}} />}
						after={team.stage >= store.appUser.point?.num ? leftTeam.length ? <Counter mode={isShow ? 'prominent' : 'primary'}>{isShow ? leftTeam[0].rate  : '-' }</Counter> : team.substage ? <><Icon16Chevron style={{color: '#4BB34B'}}/></> : 'решают загадку' : null}>
						{team.name}
					</RichCell>)
					})
				}
			
				</Group>
			}
		

		{/* <Button mode="outline" onClick={setActiveModal.bind(this, 'way')}>Маршрут</Button> */}
	
		
		
		
		{/* <ReactPlayer url={"https://www.youtube.com/watch?v=AeDJ9WqpKh4"}/> */}
		{store.homeSnackbar}
		{snackbar}
	</Panel>
</View>
)}));

export default Home;
