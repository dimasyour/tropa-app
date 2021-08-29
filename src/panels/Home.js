import React, { useState, useEffect, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { Panel, Avatar, Header, PanelHeader, Snackbar, ModalCard, PullToRefresh, Counter, FormItem, Div, Placeholder, Button, Cell, Switch, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, ViewWidth, RichCell, Caption, View, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, FormLayout, Radio, Input, Text } from '@vkontakte/vkui';
import { timeToDate, timeFormat, getDate, declOfNum } from '../utils/func';
import { Icon16ErrorCircleOutline } from '@vkontakte/icons';
import { Icon16Done, Icon16ErrorCircle, Icon24Cancel, Icon24Done, Icon24BrainOutline, Icon24ScanViewfinderOutline, Icon28Flash, Icon16Chevron } from '@vkontakte/icons';
import Status from './Status'

import { serverURL } from '../config'
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
	const [ fetchngRefreshOrgTeam, setFetchngRefreshOrgTeam ] = useState(false)

	const idRateRef = useRef()
	idRateRef.current = idRate

	const [ isShow, setIsShow ] = useState(false)
	
	useEffect(() => {
		if(store.appUser.role == 3){
			axios.get( serverURL + 'teams', { 
				params: { type: 2 }
			}).then(data => {
				setTeams(data.data.teams)
			})
		}
	}, [])
	useEffect(() => {
	}, [store.teamContest])


	const onRefreshOrgTeam = () => {
		setFetchngRefreshOrgTeam(true)
		axios.get( serverURL + 'teams', { 
			params: { type: 2 }
		}).then(data => {
			setTeams(data.data.teams)
			setFetchngRefreshOrgTeam(false)
		})
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
		axios.get( serverURL + 'rate/new', {
			params: {
				team: rateTeam._id,
				point: store.appUser.point.title, 
				comment: comment,
				rate: rate,
				org: store.appUser._id
			}
		}).then(data => {
			setActiveModal(null)
			snackbarOk(data.data.text)
			
		}).catch(err => {
			setActiveModal(null)
			snackbarErr(err.error_data.error_reason)
		})
	}
	const editRate = () => {
		axios.get(serverURL + 'rate/edit', {
			params: { 
				rate: rate,
				comment: comment,
				id: idRateRef.current._id,
			}
		}).then(data => {
			setActiveModal(null)
			snackbarOk('Оценка успешно изменена')
		}).catch(err => {
			setActiveModal(null)
			snackbarErr(err.error_data.error_reason)
		})
		axios.get( serverURL + 'teams', { 
			params: { type: 2 }
		}).then(data => {
			setTeams(data.data.teams)
		})
	}
	const onChangeComment = e => {
		setComment(e.target.value)
	}
	const onChangeAnswer = e => setAnswer(e.target.value)
	const readyForStart = () => {
		setActiveModal(null)
		axios.get( serverURL + 'teams/start', {
			params: {
				teamId: store.appUser.team._id
			}
		}).then(data => snackbarOk(data.data.text))
		.catch(err => snackbarErr(err.error_data.text))
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
			// setTimeout(() => {
			// 	setShowComplete(false)
			// 	setShowFailure(false)
			// }, 5000)
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
			<FormItem>
				Правила забега
			</FormItem>
			<FormItem>
				{store.appUser.team.allow ? 
				<Button stretched  onClick={readyForStart} mode="primary">Готовы начать</Button> 
				: <>
				 <Caption level="2" weight="semibold" caps style={{ marginBottom: 16 }}>Подойдите к организаторам</Caption>
				 <Button stretched mode="primary" disabled>Готовы начать</Button> 
				</> }
			</FormItem>
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



		{ store.appUser.team && !store.appUser?.team.startAt && store.appUser.role < 2 && <Group header={<Header mode="secondary">Ваша тропа</Header>}>
			{store.teamContest && <RichCell
			key={store.teamContest._id}
			before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}
			caption={getDate(store.teamContest.date)}
			after={store.appUser.team.stage == 0 ? store.teamContest.status ? store.appUser.role == 1 ? <Button mode="outline" onClick={setActiveModal.bind(this, 'rules')}>Начать забег</Button> : '' : timeFormat('dd дн. hh ч.',store.secToTeamContest) : '-'}>
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



		{store.appUser.team.status == 5 &&  <Placeholder
              icon={<Icon16ErrorCircleOutline width={70} height={70}/>}
            >
              Ваша команда дисквалифицирована
            </Placeholder>}
		{store.appUser.team && store.appUser.team.startAt && store.appUser.role < 3 && store.appUser.team.status != 5 && store.appUser?.team.stage != 20 && <Group header={<Header mode="secondary">Текущее задание</Header>}>

			{<TaskCard isComplete={showComplete} isFailure={showFailure} title={!store.appUser.team.substage ? '???' : store.currentTask?.title} text={!store.appUser.team.substage ? store.currentTask?.text : store.currentTask?.text2}  fileID={!store.appUser.team.substage ? store.currentTask?.task.static : null} >
				{!store.appUser.team.substage ? <Button before={<Icon24BrainOutline width={20} height={20}/>} mode="outline" onClick={setActiveModal.bind(this, 'check_ans')} stretched >Проверить ответ</Button> : <Button before={<Icon24ScanViewfinderOutline width={20} height={20}/>} mode="outline" onClick={readQR} stretched>Сканировать QR</Button>}
			</TaskCard>}
		</Group>}

		{/* <Button mode="outline" onClick={setActiveModal.bind(this, 'way')}>Маршрут</Button> */}
	
		{store.appUser.role == 3 &&  <PullToRefresh onRefresh={onRefreshOrgTeam} isFetching={fetchngRefreshOrgTeam}>
				<Group header={<Header mode="secondary">Команды-участницы</Header>}>
					<Cell disabled after={<Switch onClick={toggleShow}/>}>
						Отображать оценки
					</Cell>
				{
				teams.map(team => {
					const leftTeam = team.rates.filter(rate => rate.org == store.appUser._id)
					return (<RichCell
						onClick={team.stage >= store.appUser.point?.num ? leftTeam.length ? () => {setActiveModal('editRate'); setRateTeam(team); setIdRate(leftTeam[0])} : () => { setActiveModal('rateTeam1'); setRateTeam(team)}: null}
						caption={`группа ${team.group}`}
						before={<Avatar style={{background: team?.color}} />}
						after={team.stage >= store.appUser.point?.num ? leftTeam.length ? <Counter mode={isShow ? 'prominent' : 'primary'}>{isShow ? leftTeam[0].rate  : '-' }</Counter> : <Icon16Chevron style={{color: '#4BB34B'}}/> : null}>
						{team.name}
					</RichCell>)
					})
				}
			
				</Group>
			</PullToRefresh>
		}
		{store.appUser.team && store.appUser?.team.stage == 20 && <div>
			Вы на стадии финальной точки. Подойдите к организаторам
		</div>}
		
		{/* <ReactPlayer url={"https://www.youtube.com/watch?v=AeDJ9WqpKh4"}/> */}
		{store.homeSnackbar}
		{snackbar}
	</Panel>
</View>
)}));

export default Home;
