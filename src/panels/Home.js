import React, { useState, useEffect, Fragment, useRef } from 'react';
import { inject, observer } from 'mobx-react'
import { Panel, Avatar, Header, PanelHeader, Tabs, TabsItem, List, Snackbar, ModalCard, Counter, FormItem, Div, Placeholder, Button, Cell, Switch, Group, PanelHeaderButton, usePlatform, IOS, ANDROID, VKCOM, ViewWidth, Alert, RichCell, Link, View, Title, Caption, CellButton, useAdaptivity, ModalRoot, ModalPage, ModalPageHeader, FormLayout, Radio, Input, Text, Tooltip } from '@vkontakte/vkui';
import { timeToDate, timeFormat, getDate, declOfNum, getIcon } from '../utils/func';
import { Icon16ErrorCircleOutline } from '@vkontakte/icons';
import { Icon16Done, Icon16ErrorCircle,Icon20InfoCircleOutline, Icon24Cancel, Icon24Done,Icon20FireCircleFillRed, Icon24BrainOutline, Icon24ScanViewfinderOutline, Icon28Flash, Icon16Chevron, Icon28Notifications, Icon28RefreshOutline, } from '@vkontakte/icons';
import { Icon12OnlineVkmobile, Icon28InfoOutline, Icon24DownloadOutline } from '@vkontakte/icons';

import 'dayjs/locale/ru'
import TaskCard from './components/TaskCard'
import QRCode from 'react-qr-code'
import CustomPopout from './components/CustomPopout';
import VideoPopout from './components/VideoPopout';
import bridge from '@vkontakte/vk-bridge'
import final from '../img/final.png';
import ReactPlayer from 'react-player/lazy';

import TeamAvatar from './components/TeamAvatar';
import { Icon28GhostSimleOutline } from '@vkontakte/icons';
import { service_key, serverURL } from '../config';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

const Home = inject('store')(observer(({ id, store }) => {
	const platform = usePlatform()
	const [popout, setPopout] = useState(null)
	const { viewWidth } = useAdaptivity();
	const isMobile = viewWidth <= ViewWidth.MOBILE;
	const [ activeModal, setActiveModal ] = useState(null)
	const [ snackbar, setSnackbar ] = useState(null)
	const [ activeTabPoint, setActiveTabPoint ] = useState('history')
	const [ visibleTooltip, setVisibleTooltip ] = useState(true)

	const [ rateTeam, setRateTeam ] = useState(null)

	const [ idRate, setIdRate ] = useState(null)
	const [ comment, setComment ] = useState('')
	const [ answer, setAnswer ] = useState('')
	const [ rate, setRate ] = useState(-1)
	const [ showFailure, setShowFailure ] = useState(false)
	const [ selectedTeam, setSelectedTeam ] = useState(null)
	const [ selectedTab, setSelectedTab ] = useState('rules')
	const [ moders, setModers ] = useState([])

	const idRateRef = useRef()
	idRateRef.current = idRate

	const [ isShow, setIsShow ] = useState(false)

	const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
	institute[15] = 'поколения(день 1)'
    institute[16] = 'поколения(день 2)'
    institute[20] = 'финалисты'

	useEffect(() => {
		if(store.socket){
			store.socket.on('team:show_modal', data => {
				if(data.modal == "intro"){
					setPopout(<VideoPopout onClose={setPopout.bind(this, null)}/>)
				}
			})
			if(store.appUser.role > 3){
				const startParams = new URLSearchParams(window.location.search)
				const allowed = startParams.get("vk_are_notifications_enabled")
				if(allowed == 0){
					setActiveModal('req_notify')
				}
			} else if(store.appUser.role == 1){
				const startParams = new URLSearchParams(window.location.search)
				const allowed = startParams.get("vk_are_notifications_enabled")
				if(allowed == 0){
					setActiveModal('req_notify_leader')
				}
			}
		}
		
	}, [])


	const downloadBtn = store.appUser?.team?.stage == 9 && store.appUser?.team?.substage == 0 && <Tooltip onClose={() => {setVisibleTooltip(false);}} isShown={visibleTooltip} text="Вы можете скачать изображение" offsetY="10">
		<Link onClick={() => bridge.send("VKWebAppDownloadFile", {"url": `https://leton.cc/image/${store.currentTask?.task?.static?.value}`, "filename": `${store.currentTask?.task?.static?.value}.png`})} style={{marginRight: 25}}><Icon24DownloadOutline width={20} height={20}/></Link>
	</Tooltip>

	const openModal = (team) => {
		store.socket.emit('moder:show_modal', { team: team, modal: 'intro'})
	}
	const requestNotify = () => {
		bridge.send("VKWebAppAllowNotifications").catch(err => {
			if(err.error_data.error_code == 4){
				console.log('deny')
			}
		});
	}
	if(store.socket){
		store.socket.on('team:started', () => {
			store.socket.emit('user:get_task', { team: store.appUser.team._id})
			setActiveModal(null)
		})
		store.socket.on('team:finished', () => {
			console.log('finished')
			setActiveModal(null)
		})
		store.socket.on('org:get_moders', (data) => {
			setModers(data.moders)
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

	const confirmCloseQr = () => {
		setPopout(<Alert
			actions={[{
				title: 'Отмена',
				autoclose: true,
				mode: 'cancel'
			  }, {
				title: 'Подтверждаю',
				autoclose: true,
				mode: 'destructive',
				action: () => setActiveModal('rateTeam2'),
			  }]}
			  actionsLayout="horizontal"
			  onClose={setPopout.bind(this, null)}
			  header="Подтверждение действия"
			  text="Команда получила загадку и ушла с точки?"
		/>)
	}

	const readQR = () => {
		if(platform == ANDROID) {
			bridge.send("VKWebAppOpenCodeReader").then(res => {
				const { code_data } = res
				store.socket.emit('qrcode', {qrHash: code_data, stage: store.appUser.team.stage, team: store.appUser.team._id})
				store.socket.on('qrcode_response', data => {
					if(data.response == 20){
						return setActiveModal('endgame')
					}
					if(data.response){
						snackbarOk('Верный QR')
					} else {
						snackbarErr('QR не подходит')
					}
				})
			}).catch(err => {
				if(err.error_type == "client_error"){
					snackbarErr(err.error_data.error_reason)
				}
			})
		} else {
			const onScan = res => {
				if(res){
					setPopout(null)
					store.socket.emit('qrcode', {qrHash: res, stage: store.appUser.team.stage, team: store.appUser.team._id})
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
				}
			}
			const onError = res => {
				if(res){
					setPopout(null)
					snackbarErr(res)
				}
			}
			setPopout(<CustomPopout onScan={onScan} onError={onError} onClose={setPopout.bind(this, null)}/>)
		}
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
		setRate(-1)
		setComment('')
	}
	const editRate = () => {
		setActiveModal(null)
		store.socket.emit('org:edit_rate', { 
			rate: rate,
			comment: comment,
			id: idRateRef.current._id,
		})
		snackbarOk('Оценка успешно изменена')
		setRate(-1)
		setComment('')
	}
	const onChangeComment = e => {
		setComment(e.target.value)
	}
	const sendNotify = () => {
		const message = `На точке ${store.appUser.point.title.toUpperCase()} что-то произошло!`
		bridge.send("VKWebAppCallAPIMethod", {"method": "notifications.sendMessage", "params": {"user_ids": moders.join(','), "v":"5.131", "random_id": new Date().getTime() , "access_token": service_key, "message": message}}).then(data => {
			
		})
	}
	const onChangeAnswer = e => setAnswer(e.target.value)

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
	const finishtask = {title:"Завершение забега", text:"Молодцы! Возвращайтесь к 5 корпусу и выполните своё последнее задание."}
	const attention = { title:"ВАЖНАЯ ИНФОРМАЦИЯ", text:`В связи с эпидемиологической обстановкой команды на старт будут приходить по очереди к определённому времени. Не приходите раньше, но и не опаздывайте!
	Мы ждем вас на старте у ИТЦ`}
	const toggleShow = () => setIsShow(!isShow)
	const modalRoot =  <ModalRoot activeModal={activeModal}>
		<ModalCard
          id="endgame"
          onClose={() => setActiveModal(null)}
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
			onClose={() => setActiveModal(null)}
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
			id="req_notify_leader"
			onClose={() => setActiveModal(null)}
			header="Уведомления"
			subheader="Теперь ты капитан команды, а поэтому нам бы хотелось держать тебя в курсе всех событий. Разреши, пожалуйста, уведомления"
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
			onClose={() => setActiveModal(null)}
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
				<div style={{padding: '0 10px'}}>
					<Text weight="bold">Дорогие первокурсники! Чтобы ваша «Тропа» прошла без проблем и оставила только хорошие воспоминания, соблюдайте эти несложные правила:</Text>
					<br/>
					<Text weight="bold">1. Не выбегайте на проезжую часть. Вся игра проходит на территории студенческого городка, а именно в квадрате, окруженном улицами – проспектом Ленина, ул. Агеева, ул. Фридриха Энгельса, ул. Мира.</Text>

					<Text weight="semibold">В противном случае вы автоматически выбываете из игры и получаете дисциплинарное взыскание по решению Университета.</Text>
					<br/>
					<Text weight="bold">2. Не ругайтесь матом и не употребляйте в своей речи нецензурные выражения.</Text>
					<br/>
					<Text weight="bold">3. Во время игры строго запрещено распивать спиртные напитки.</Text>
					<br/>
					<Text weight="bold">4. Не курите во время игры. Под запретом также находятся кальяны, система IQOS и вейпы.</Text>
					<br/><br/>
					<Text weight="bold">В случае любых проблем вы можете нажать на иконку огонька в приложении или позвонить главному организатору Анастасии Артемовой. Ее номер вы найдете на бейджах организаторов или на выданной вам карте.</Text>
        		</div>
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
						<QRCode value={'finish|'+store.appUser?.team?._id} />		
					</Div>

				 </> :  <Caption level="2" weight="semibold" caps style={{ marginBottom: 16 }}>У капитана вашей команды есть инструкция</Caption>}
			
		</ModalPage>
		<ModalPage
		id="teamActions"
		onClose={() => { setActiveModal(null); setSelectedTeam(null) }}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Действия с командой "{selectedTeam?.name ?? '-'}"
		  </ModalPageHeader>} >
		  	<List>
		  		<CellButton onClick={setActiveModal.bind(this, 'teamRates')}>Посмотреть оценки</CellButton>
			  	<CellButton onClick={() => { openModal(selectedTeam?._id); setActiveModal(null)}}>Показать интро видео</CellButton>
		  	</List>
		</ModalPage>
		<ModalPage
		id="teamRates"
		onClose={() => { setActiveModal(null); setSelectedTeam(null) }}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Оценки "{selectedTeam?.name ?? '-'}"
		  </ModalPageHeader>} >
		  	<List>
				  {selectedTeam?.rates.length ? selectedTeam?.rates.map(rate => (<RichCell
                 disabled
                 multiline
                 text={rate.comment[rate.comment.length - 1].length ? rate.comment[rate.comment.length - 1] : 'без комментария'}
                 caption={rate.point}
                 after={rate.rate + ' ' + declOfNum(rate.rate, ['балл', 'балла', 'баллов'])}
                >
                     {rate.org.vkUser}
                </RichCell>)) : <Placeholder
              icon={<Icon28InfoOutline width={80} height={80}/>}
            >
              Оценок ещё нет
            </Placeholder>}
			  
		  	</List>
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
				<Caption style={{textAlign: 'center	'}} widht="semibold" level="2" caps>Нажимайте "Далее" в том случае, если команда получила новую загадку и вы убелись в этом</Caption>
				<Button size="m" stretched onClick={confirmCloseQr}>Далее</Button>
			</Div>
		</ModalPage>
		<ModalPage
		id="rateTeam2"
		settlingHeight={100}
		header={<ModalPageHeader>
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
						<Button size="l" stretched onClick={rate == -1 ? null : sendRate} disabled={rate == -1}>Оценить</Button>
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
						<Button size="l" stretched onClick={rate == -1 ? null : editRate} disabled={rate == -1}>Изменить</Button>
					</FormItem>
				</FormLayout>
			</Div>
		</ModalPage>
		<ModalPage
		id="pointContent"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			О точке
		  </ModalPageHeader>} >
			  <Tabs>
				  <TabsItem
				  onClick={setActiveTabPoint.bind(this, 'task')}
				  selected={activeTabPoint === 'task'}
				  >
					  Задание
				  </TabsItem>
				  <TabsItem
				  onClick={setActiveTabPoint.bind(this, 'history')}
				  selected={activeTabPoint === 'history'}
				  >
					  Справка
				  </TabsItem>
				  <TabsItem
				  onClick={setActiveTabPoint.bind(this, 'waste')}
				  selected={activeTabPoint === 'waste'}
				  >
					  Занималки
				  </TabsItem>
			  </Tabs>
			{activeTabPoint === 'history' && <Div>
				<Header mode="primary">{store.appUser?.point?.title}</Header>
				<Text>{store.appUser?.point?.history}</Text>
				
			</Div>}
			{activeTabPoint === 'waste' && <Div>
			<Header mode="primary" multiline>{store.appUser?.point?.microTask?.title}</Header>
				<Text>{store.appUser?.point?.microTask?.description}</Text>
				<Header mode="primary">Материалы</Header>
				{store.appUser?.point?.microTask?.material ? <List>
					{store.appUser?.point?.task?.description.material.map(material => 
						<Group header={<Header mode="secondary">{material.title}</Header>}>
							{Array.isArray(material.description) ? <List>
								{material.description.map(mat => <Text>{mat}</Text>)}
							</List> : material.description}
						</Group>
					)}
					</List> : <Placeholder icon={<Icon28GhostSimleOutline width={70} height={70}/>}>
						Материалов для занималок нет
						</Placeholder>}
				</Div>}
			{activeTabPoint === 'task' && <Div>
				<Header mode="primary" multiline>{store.appUser?.point?.task?.pointTaskTitle}</Header>
				<Text>{store.appUser?.point?.task?.description.task}</Text>
				<Header mode="primary">Материалы</Header>
				{store.appUser?.point?.task?.description.material ? <List>
					{store.appUser?.point?.task?.description.material.map(material => 
						<Group header={<Header mode="secondary">{material.title}</Header>}>
							{Array.isArray(material.description) ? <List>
								{material.description.map(mat => <Text>{mat}</Text>)}
							</List> : material.description}
						</Group>
					)}
					</List> : <Placeholder icon={<Icon28GhostSimleOutline width={70} height={70}/>}>
						Материалов для вашей точки нет
						</Placeholder>}
				</Div>}
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
				<FormItem top="Как называется следующая точка?">
					<Input onChange={onChangeAnswer}/>
				</FormItem>
			</FormLayout>
		</ModalPage>
		
	</ModalRoot>
	return (

		<View id="home" activePanel="home" modal={modalRoot} popout={popout}>
								<Panel id={id}>
		<PanelHeader >Тропа первака 2021  </PanelHeader>
	


		{store.vk_u &&
		<Group>

			<Cell
				before={store.vk_u.photo_200 ? <Avatar src={store.vk_u.photo_200}/> : null}
				description={<div>{store.userRole}</div>}
			>
				{`${store.vk_u.first_name} ${store.vk_u.last_name}`}
			</Cell>
		</Group>}

			{store.appUser.team ? 
			// С КОМАНДОЙ
			<>

			{ store.appUser.team && !store.appUser?.team.startAt && store.appUser.role < 2 && store.appUser.team.stage < 20 && <Group header={<Header mode="secondary">Ваша тропа</Header>}>
						{store.teamContest && <RichCell
						key={store.teamContest._id}
						before={<Avatar src={getIcon(store.teamContest.role)} mode="app"/>}
						caption={getDate(store.teamContest.date)}
						after={store.appUser.team.stage == 0 ? store.teamContest.status ? store.appUser.role == 1 ? store.appUser.team.status == 3 ? <Button mode="outline" onClick={setActiveModal.bind(this, 'rules')}>Начать забег</Button> : '' : '' : timeFormat('dd дн. hh ч.',store.secToTeamContest) : '-'}>
							{store.teamContest.name}
						</RichCell>}
					</Group>
					}
					{/* {store.appUser.team.start && store.appUser.team.currTask} */}
			{store.appUser.role == 2 && store.activeContest && !store.appUser.team?.role.incudes(store.activeContest?.role) && <Group header={<Header mode="secondary">Активная тропа</Header>}>
				<RichCell
				key={store.activeContest._id}
				before={<Avatar src={getIcon(store.activeContest.role)} mode="app"/>}>
					{store.activeContest.name}
				</RichCell>
			</Group>
			}
			
			{store.appUser.team && !store.appUser?.team.startAt && store.appUser.team.status == 3 && store.appUser.role < 2 && <TaskCard info={attention}>
						<div style={{textAlign: 'center', fontSize: 30}}>
						{store.teamStartTime}
						</div>
						</TaskCard>}

			{store.appUser.team && store.appUser.team.startAt && store.appUser.role < 3 && store.appUser.team.status != 5 && store.appUser?.team.stage != 20 && store.appUser?.team.stage != 21 && <Group header={<Header mode="secondary" aside={<>{downloadBtn}<Link onClick={() => {store.socket.emit('user:get_task', { team: store.appUser.team._id});snackbarOk('Данные обновлены');}}><Icon28RefreshOutline width={20} height={20}/></Link></>} >Текущее задание</Header>}>

				{<TaskCard task={store.currentTask} stage={store.appUser.team.substage}>
					{!store.appUser.team.substage ? <Button before={<Icon24BrainOutline width={20} height={20}/>} mode="outline" size="m" onClick={setActiveModal.bind(this, 'check_ans')} stretched >Проверить ответ</Button> : <Button size="m" before={<Icon24ScanViewfinderOutline width={20} height={20}/>} mode="outline" onClick={readQR} stretched>Сканировать QR</Button>}
				</TaskCard>}
			</Group>}

			{store.appUser.team.status == 5 &&  <Placeholder
			icon={<Icon16ErrorCircleOutline width={70} height={70}/>}
			>
			Ваша команда дисквалифицирована
			</Placeholder>}

			{store.appUser.team && store.appUser?.team.stage == 20 && <div>
			<TaskCard info={finishtask}>
				<Button mode="outline" before={<Icon12OnlineVkmobile/>} onClick={setActiveModal.bind(this, 'finish')} stretched>Задание</Button>
			</TaskCard>
			</div>}

			{store.appUser.team && store.appUser?.team.stage == 21 && <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
				{store.appUser?.team.role.includes(15) || store.appUser?.team.role.includes(16) || store.appUser?.team.role.includes(20) ? 
				<ReactPlayer url={`${serverURL}video/outro`} width="100%" controls={true} light={'https://leton.cc/image/preview'}/>
				: <LazyLoadImage
				 src={final}
				/>}
				<div style={{marginTop: 20, textAlign: 'center'}}>
					<Title level={2} weight="semibold" style={{fontSize: '24px'}}>Поздравляем! Вы прошли свою «Тропу Первака»!</Title>
					{store.teamContest?.results?.length ? <Title level={3} weight="semibold" multiline>Результаты вашего забега уже опубликованы на вкладке "Забеги > Прошедшие"</Title> : <Title level={3} weight="semibold" multiline>Ожидайте результатов забега в нашей группе ВКонтакте и в мини-приложении на вкладке «Забеги»</Title> } 
					
				</div>
			</div>}

			</>
			:
			// БЕЗ КОМАНДЫ
			<>
			{store.appUser.role < 3 && store.activeContest && <Group header={<Header mode="secondary">Активная тропа</Header>}>
				<RichCell
				key={store.activeContest._id}
				before={<Avatar src={getIcon(store.activeContest.role)} mode="app"/>}>
					{store.activeContest.name}
				</RichCell>
			</Group>}
			
			</>
			}
			{store.appUser.role > 3 && store.activeContest && <Group header={<Header mode="secondary" aside={<Link onClick={() => {store.socket.emit('org:refresh_team');snackbarOk('Данные обновлены');}}><Icon28RefreshOutline width={20} height={20}/></Link>}>Положение команд</Header>}>
				{ 
				store.orgTeams.length ? 
				store.orgTeams.map(team => {
					const rate = team.rates.reduce((acc, rate) => acc + rate.rate, 0)
					return (<RichCell
				key={team._id}
				before={<TeamAvatar team={team}/>}
				text={team.stage ? team.stage == 20 ? "Бегут на финиш" : team.stage == 21 ? "Финишировали" : `Точка ${team.stage}` : `Стартуют в ${dayjs(new Date(team.startTime)).locale('ru').format('HH:mm')}`}
				after={rate + ' ' + declOfNum(rate , ['балл', 'балла', 'баллов'])}
				caption={team.stage < 20 ? team.substage ? 'на точке' : team.stage ? 'решают загадку' : '' : ''}
				onClick={() => {setSelectedTeam(team); setActiveModal('teamActions')}}
				>
					{team.name}
				</RichCell>)}) :
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, color: 'var(--text_secondary)'}}>
					<Icon28InfoOutline width={80} height={80}/>
					<div style={{fontSize: 24, marginTop: 10}}>Список команд скоро появится</div>
				</div>
				}
			</Group>}


			{store.appUser.role == 3 && <>
				<Group header={<Header mode="secondary" aside={<><Link style={{marginRight: 24}} onClick={setActiveModal.bind(this, 'pointContent')}><Icon20InfoCircleOutline width={25} height={25}/></Link><Link style={{marginRight: 24}} onClick={onAhtung}><Icon20FireCircleFillRed width={20} height={20}/></Link><Link onClick={() => {store.socket.emit('org:refresh_team');snackbarOk('Данные обновлены');}}><Icon28RefreshOutline width={25} height={25}/></Link></>}>Моя точка</Header>}>
					<Cell disabled after={<Switch onClick={toggleShow}/>}>
						Отображать оценки
					</Cell>
				{
				store.orgTeams.length ? 
				store.orgTeams.map(team => {
					const ratesOnPoint = team.rates.filter(rate => rate.point == store.appUser.point.title)
					let index = (store.appUser.point?.num - 1) * 2
					const teamOnPoint = team.stage == store.appUser.point?.num
					const teamBefore = team.stage < store.appUser.point?.num
					const solveTask = team.substage == 0
					const right = teamBefore ? null : 
					(teamOnPoint ? solveTask ? ('решают загадку') : (ratesOnPoint.length ? <Counter mode={isShow ? 'prominent' : 'primary'}>{isShow ? ratesOnPoint[0].rate  : '-' }</Counter> : <Icon16Chevron style={{color: '#4BB34B'}}/>) : 
					(ratesOnPoint.length ? <Counter mode={isShow ? 'prominent' : 'primary'}>{isShow ? ratesOnPoint[0].rate  : '-' }</Counter> : <Icon16Chevron style={{color: '#4BB34B'}}/>))
					const click = teamBefore ? null : 
					(teamOnPoint ? solveTask ? null : (ratesOnPoint.length ? () => {setActiveModal('editRate'); setRateTeam(team); setIdRate(ratesOnPoint[0])} : () => { setActiveModal('rateTeam1'); setRateTeam(team)}) : 
					(ratesOnPoint.length ? () => {setActiveModal('editRate'); setRateTeam(team); setIdRate(ratesOnPoint[0])} : () => { setActiveModal('rateTeam2'); setRateTeam(team)}))
					return (<RichCell
						onClick={click}
						caption={`${institute[team.institute]}${team.group ? ', гр.'+team.group : ''}${team.timings[index] && team.stage == store.appUser.point?.num ? `, ушли с прошлой точки в ${new Date(team.timings[index]).getHours()}:${new Date(team.timings[index]).getMinutes() < 10 ? '0' + new Date(team.timings[index]).getMinutes() : new Date(team.timings[index]).getMinutes()}` : ''}`}
						before={<TeamAvatar team={team}/>}
						after={right}>
						{team.name}
					</RichCell>)
					}) : 
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, color: 'var(--text_secondary)'}}>
						<Icon28InfoOutline width={80} height={80}/>
						<div style={{fontSize: 24, marginTop: 10}}>Список команд скоро появится</div>
					</div>
				}
			
				</Group>
				</>
			}
		{store.homeSnackbar}
		{snackbar}
		{/* {<Button onClick={openModal.bind(this, '6159dc124dda1ce243b10ab4')}>Открыть модалку</Button>} */}
		{/* <Button onClick={() => bridge.send("VKWebAppDownloadFile", {"url": "https://leton.cc/image/preview", "filename": "preview.png"})}>Скачать картинку</Button> */}
	</Panel>
</View>
)}));

export default Home;
