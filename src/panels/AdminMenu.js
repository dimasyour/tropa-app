import React, { useEffect, useState, Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import { Panel, PanelHeader, Group, Header, SimpleCell, CellButton, ModalRoot, ModalPage, Input, List, Alert, FormLayout, FormItem, View, ModalPageHeader, PanelHeaderButton, usePlatform, ANDROID, VKCOM, IOS, Cell, Avatar, Gradient, Title, InfoRow, RichCell, SelectMimicry, Radio, FormLayoutGroup, Separator, Footer } from '@vkontakte/vkui';
import { Icon16StarCircle, Icon24ScanViewfinderOutline } from '@vkontakte/icons';
import { Icon28ChevronDownOutline, Icon24Cancel, Icon24Done, Icon24UserAdded, Icon28User, Icon28Search, Icon20CheckCircleFillGreen, Icon20CancelCircleFillRed, Icon28ChecksOutline } from '@vkontakte/icons';
import { Snackbar } from '@vkontakte/vkui'
import { Icon16Done, Icon16ErrorCircle} from '@vkontakte/icons'
import { Icon24BrowserBack } from '@vkontakte/icons';
import axios from 'axios';
import useInput from './hooks/useInput';
import { serverURL, access_token } from '../config';
import bridge from '@vkontakte/vk-bridge'
import { getTime, timeToDate, timeFormat, declOfNum, getDate } from '../utils/func';
import TeamAvatar from './components/TeamAvatar';
import CustomPopout from './components/CustomPopout';

const AdminMenu = inject('store')(observer(({ id, store }) => {
    const platform = usePlatform()
    const [searchInput, setSearchInput] = useState('')
    const [activeModal, setActiveModal] = useState(null)
    const [usersFound, setUsersFound] = useState([])
    const [teamsFound, setTeamsFound] = useState([])
    const [snackbar, setSnackbar] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState('')
    const [popout, setPopout] = useState(null)
    const [orgAvatars, setOrgAvatars] = useState([])


    useEffect(() => {
        if(activeModal == 'selectPoint'){
            store.getCycle()
        }
        if(activeModal == null){
            setSearchInput('')
        }
    },[activeModal])

    const readQR = () => {
        if(platform == ANDROID) {
			bridge.send("VKWebAppOpenCodeReader").then(res => {
                const { code_data } = res
                const [ action, team ] = code_data.split('|')
                if(action == 'start'){
                    store.socket.emit('team:ready_start', {teamId: team})
                    setSnackbar(snackbarOk('Команда теперь может начать забег. Проверь это на их экране'))
                } else if(action == 'finish'){
                    store.socket.emit('team:finish_team', {teamId: team})
                    setSnackbar(snackbarOk('Забег команды завершён. Проверь это на их экране'))
                } else {
                    setSnackbar(snackbarErr('QR не подходит'))
                }
            }).catch(err => {
                if(err.error_type == "client_error"){
                    setSnackbar(snackbarErr(err.error_data.error_reason))
                } else {
                    setSnackbar(snackbarErr(err.message))
                }
            })
		} else {
			const onScan = res => {
				if(res){
                    const [ action, team ] = res.split('|')
					setPopout(null)
					if(action == 'start'){
                        store.socket.emit('team:ready_start', {teamId: team})
                        setSnackbar(snackbarOk('Команда теперь может начать забег. Проверь это на их экране'))
                    } else if(action == 'finish'){
                        store.socket.emit('team:finish_team', {teamId: team})
                        setSnackbar(snackbarOk('Забег команды завершён. Проверь это на их экране'))
                    } else {
                        setSnackbar(snackbarErr('QR не подходит'))
                    }
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

    
    const setOrgAlert = () => {
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'ДА',
                autoclose: true,
                mode: 'destructive',
                action: () => updateOrgStatus(3),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Назначение организатором"
              text={`${selectedUser.vkUser} будет назачен организатором, уверены?`}
        />)
        
    }

    const setModerAlert = () => {
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'ДА',
                autoclose: true,
                mode: 'destructive',
                action: () => updateModerStatus(4),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Назначение организатором"
              text={`${selectedUser.vkUser} будет назачен модератором, уверены?`}
        />)
        
    }

    const alertActivateContest = (current) => {
        const activateContest = () => {
            axios.get(serverURL + 'contest/update', { params: { 
                id: current._id,
                status: +!current.status,
            }}).then(d => {
                setActiveModal(null)
                setSnackbar(snackbarOk(d.data.text))
                store.getContestList()
            }).catch(e => {
                setActiveModal(null)
                setSnackbar(snackbarErr('Что-то пошло не так'))
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: current.status ? 'Завершить' : 'Начать',
                autoclose: true,
                mode: 'destructive',
                action: () => activateContest(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Статус забега"
              text={`Статус ${current.name} будет изменён на "${current.status ? 'завершён' : 'проходит'}"`}
        />)
    }

    const teamPoints = selectedTeam?.rates.reduce((acc, rate) => acc + rate.rate, 0) ?? 0

    const handleSelectTeam = team => {
        let ids = team.mates.map(mate => mate.uid)
        bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": ids.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(data => {
                let mates = team.mates.map((user, index) => {user.photo = data.response[index].photo_200; user.vkUser = `${data.response[index].first_name} ${data.response[index].last_name}`; return user})
                setSelectedTeam({ ...selectedTeam, ...team, mates: mates})
            })
    }

    const handleOpenRate = () => {
        let ids = selectedTeam?.rates.length ? selectedTeam?.rates.map(rate => rate.org.uid) : null
        if(ids){
            return bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": ids.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(data => {
                setOrgAvatars(data.response.map(user => user.photo_200))
                setActiveModal('searchTeam_rates')
            })
        }
        return setActiveModal('searchTeam_rates')
    }
    const snackbarOk = text => {
        return (<Snackbar
            onClose={() => setSnackbar(null)}
            before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
            >
                {text}
            </Snackbar>)
    }
    const snackbarErr = text => {
        return (<Snackbar
            onClose={() => setSnackbar(null)}
            before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
          >
             {text}
          </Snackbar>)
    }


    const alertAllowTeam = () => {
        const allow = () => {
            axios.get(serverURL + 'teams/update', { params:{
                type: 'allow',
                teamId: selectedTeam?._id
            }}).then(d => {
                setSnackbar(snackbarOk(d.data.text))
                setActiveModal(null)
            }).catch(e => {
                setSnackbar(snackbarErr('Что-то пошло не так'))
                setActiveModal(null)
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'Выдать разрешение',
                autoclose: true,
                mode: 'destructive',
                action: () => allow(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Разрешение на старт"
              text={`Вы уверены, что хотите выдать разрешение команде ${selectedTeam?.name}?`}
        />)
    }
    const demoteAllOrgs = () => {
        const demote = () => {
            axios.get(serverURL + 'users/demoteAll').then(d => {
                setSnackbar(snackbarOk(d.data.text))
            }).catch(e => {
                setSnackbar(snackbarErr('Что-то пошло не так'))
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'Разжаловать',
                autoclose: true,
                mode: 'destructive',
                action: () => demote(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Глобальное понижение"
              text="Вы уверены, что хотите разжаловать всех организаторов?"
        />)
    }
    const demoteAllModers = () => {
        const demote = () => {
            axios.get(serverURL + 'users/demoteModersAll').then(d => {
                setSnackbar(snackbarOk(d.data.text))
            }).catch(e => {
                setSnackbar(snackbarErr('Что-то пошло не так'))
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'Разжаловать',
                autoclose: true,
                mode: 'destructive',
                action: () => demote(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Глобальное понижение"
              text="Вы уверены, что хотите разжаловать всех модераторов?"
        />)
    }
    const disqTeam = (team) => {
        const disq = () => {
            axios.get(serverURL + 'teams/update', {
                params: { 
                    type: 'status',
                    teamId: team,
                    newStatus: 5
                }
            }).then(d => {
                setActiveModal(null)
                setSnackbar(snackbarOk(`"${selectedTeam?.name}" дисквалифицированы`))
            }).catch(e => {
                setActiveModal(null)
                setSnackbar(snackbarErr('Ошибка дисквалификации'))
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'Дисквалифицировать',
                autoclose: true,
                mode: 'destructive',
                action: () => disq(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Дисквалификация"
              text={`Вы уверены, что хотите дисквалифицировать команду ${selectedTeam?.name}?`}
        />)
    }
    const rehabilTeam = (team) => {
        const disq = () => {
            axios.get(serverURL + 'teams/update', {
                params: { 
                    type: 'status',
                    teamId: team,
                    newStatus: 3
                }
            }).then(d => {
                setActiveModal(null)
                setSnackbar(snackbarOk(`"${selectedTeam?.name}" реабилитированы`))
            }).catch(e => {
                setActiveModal(null)
                setSnackbar(snackbarErr('Ошибка реабилитации. Они всё ещё мертвы'))
            })
        }
        setPopout(<Alert
            actions={[{
                title: 'Отмена',
                autoclose: true,
                mode: 'cancel'
              }, {
                title: 'Реабилитировать',
                autoclose: true,
                mode: 'destructive',
                action: () => disq(),
              }]}
              actionsLayout="horizontal"
              onClose={setPopout.bind(this, null)}
              header="Реабилитация"
              text={`Вы уверены, что хотите вернуть команду ${selectedTeam?.name}?`}
        />)
    }
    const onChangeSearchInput = (e) => setSearchInput(e.target.value)
    const onChangePoint = (e) => setSelectedPoint(e.target.value)
    const findUser = () => {
        axios.get( serverURL + 'users/find', { params: {
            req_u: searchInput
        }}).then(data => {
            var users = data.data.users
            if(users.length){
                const ids = users.map(user => user.uid)
                bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": ids.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200, screen_name"}}).then(data => {
                    users = users.map((user, index) => {user.photo = data.response[index].photo_200;user.screen_name = data.response[index].screen_name; return user})
                    setUsersFound(users)
                })
                setActiveModal('searchUser_response')
            } else {
                setActiveModal(null)
                setSnackbar(snackbarOk('Совпадения не найдены'))
            }
        }).catch(err => {
            setActiveModal(null)
            setSnackbar(snackbarErr(err.response_data?.text ?? 'Непредвиденная ошибка'))
        })
    }
    const findTeam = () => {
        axios.get( serverURL + 'teams/find', { params: {
            name: searchInput
        }}).then(data => {
            var teams = data.data.teams
            if(teams.length){
                setTeamsFound(teams)
                setActiveModal('searchTeam_response')
            } else {
                setActiveModal(null)
                setSnackbar(snackbarOk('Совпадения не найдены'))
            }
        }).catch(err => {
            setActiveModal(null)
            setSnackbar(snackbarErr(err.response_data?.text ?? 'Непредвиденная ошибка'))
        })
    }
    const updateOrgStatus = (status) => {
        axios.get( serverURL + 'users/update', { params: {
            userId: selectedUser?._id,
            type: 'org',
            role: status
        }}).then(d => {
            setActiveModal(null)
            setSnackbar(snackbarOk(d.data.text))
        }).catch(e => {
            setActiveModal(null)
            setSnackbar(snackbarErr(e.error_response.text))
        })
    }
    const updateModerStatus = (status) => {
        axios.get( serverURL + 'users/update', { params: {
            userId: selectedUser?._id,
            type: 'moder',
            role: status
        }}).then(d => {
            setActiveModal(null)
            setSnackbar(snackbarOk(d.data.text))
        }).catch(e => {
            setActiveModal(null)
            setSnackbar(snackbarErr(e.error_response.text))
        })
    }
    const setOrgPoint = () => {
        axios.get( serverURL + 'users/update', { params: {
            userId: selectedUser?._id,
            type: 'point',
            point: selectedPoint
        }}).then(d => {
            setActiveModal(null)
            setSnackbar(snackbarOk(d.data.text))
        }).catch(e => {
            setActiveModal(null)
            setSnackbar(snackbarErr(e.error_response.text))
        })
    }
    const status = [
        "участник",
        'капитан',
        'наблюдатель',
        'организатор',
        'модератор',
        'администратор'
    ]
    const statusTeam = [
        'заявка отклонена',
        'заявка отложена',
        'заявка на рассмотрении',
        'заявка подтверждена',
        '',
        'дисквалифицированы'
    ]
    const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
	const modals = (<ModalRoot activeModal={activeModal}>
        <ModalPage id="contests"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
        
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={ searchInput.length > 2 && (
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={findUser}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={findUser}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Забеги
		  </ModalPageHeader>} >
           <FormLayoutGroup>
               {store.contestList.map(contest => (
                   <RichCell
                   onClick={contest.status != 2 ? alertActivateContest.bind(this, contest) : null}
                   key={contest._id}
                   text={contest.institute}
                   caption={getDate(contest.date)}
                   after={contest.status ? contest.status == 2 ? <Icon28ChecksOutline/> : <Icon20CheckCircleFillGreen/> : <Icon20CancelCircleFillRed/>}
                   >{contest.name}</RichCell>
               ))}
           </FormLayoutGroup>
        </ModalPage>
        <ModalPage id="searchUser"
        onClose={() => setActiveModal(null)}
        header={<ModalPageHeader
        
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={ searchInput.length > 2 && (
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={findUser}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={findUser}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Поиск пользователя
		  </ModalPageHeader>} >
            <FormLayout>
                <FormItem top="Кого ищем? Имя_Фамилия">
                    <Input value={searchInput} onChange={onChangeSearchInput}/>
                </FormItem>
            </FormLayout>
        </ModalPage>
        <ModalPage id="searchTeam"
        onClose={() => setActiveModal(null)}
        header={<ModalPageHeader
        
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={ searchInput.length > 2 && (
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={findTeam}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={findTeam}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Поиск команды
		  </ModalPageHeader>} >
            <FormLayout>
                <FormItem top="Кого ищем? Название команды">
                    <Input value={searchInput} onChange={onChangeSearchInput}/>
                </FormItem>
            </FormLayout>
        </ModalPage>
        <ModalPage id="searchUser_response"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setSearchInput('')}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Найдено {usersFound.length} совпадений
		  </ModalPageHeader>}
        >
            {usersFound.length ? usersFound.map(user => (
                <Cell before={<Avatar src={user.photo}/>} onClick={() => {
                    setSelectedUser(user)
                    setActiveModal('searchUser_detailed');
                }}>
                    {user.vkUser}
                </Cell>
            )) : 'Совпадения не найдены'}
        </ModalPage>
        <ModalPage id="searchTeam_response"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setSearchInput('')}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Найдено {teamsFound.length} совпадений
		  </ModalPageHeader>}
        >
            {teamsFound.length ? teamsFound.map(team => (
                <Cell before={<TeamAvatar team={team}/>} onClick={() => {
                    handleSelectTeam(team)
                    setActiveModal('searchTeam_detailed');
                }}>
                    {team.name}
                </Cell>
            )) : 'Совпадения не найдены'}
        </ModalPage>
        <ModalPage id="searchUser_detailed"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setSelectedUser(null)}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			@{selectedUser?.screen_name}
            
		  </ModalPageHeader>}
        >
             <Gradient style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 32,
          }}>
            <Avatar size={96} src={selectedUser?.photo}/>
            <Title style={{marginBottom: 8, marginTop: 20}} level="2"
                   weight="medium">{selectedUser?.vkUser}</Title>
            </Gradient>
            <Group>
                <Header mode="secondary">Пользователь</Header>
                <SimpleCell multiline>
                <InfoRow header="Роль">
                    {status[selectedUser?.role]}
                </InfoRow>
                </SimpleCell>
                {selectedUser?.role < 3 && selectedUser?.team && (<><Header mode="secondary">Команда</Header>
                    <SimpleCell>
                        <InfoRow header="Название">
                            {selectedUser?.team.name}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell>
                        <InfoRow header="Институт">
                            {institute[selectedUser?.team.institute]}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell>
                        <InfoRow header="Участников">
                            {selectedUser?.team.mates.length}
                        </InfoRow>
                    </SimpleCell>
                </>)}
                {selectedUser?.role == 3 && 
                <FormLayout>
                    <FormItem top="Точка">
                        <SelectMimicry onClick={setActiveModal.bind(this, 'selectPoint')} onChange={onChangePoint} placeholder={selectedUser?.point?.title ?? "Выберите точку"}/>
                    </FormItem>
                </FormLayout>}
                {selectedUser?.role != 3 && store.appUser.role == 5 && <CellButton onClick={setOrgAlert}>Назначить организатором</CellButton>}
                {selectedUser?.role == 3 && store.appUser.role == 5 && <CellButton mode="danger" onClick={updateOrgStatus.bind(this, 2)}>Разжаловать организатора</CellButton>}
                {selectedUser?.role < 3 && store.appUser.role == 5 && <CellButton onClick={setModerAlert}>Назначить модератором</CellButton>}
                {selectedUser?.role == 4 && store.appUser.role == 5 && <CellButton onClick={updateOrgStatus.bind(this, 2)}>Разжаловать модератора</CellButton>}
            </Group>
        </ModalPage>
        <ModalPage id="searchTeam_detailed"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setSelectedUser(null)}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			{selectedTeam?.name}
            
		  </ModalPageHeader>}
        >
             <Gradient style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 32,
          }}>
            <TeamAvatar team={selectedTeam} size={64}/>
            <Title style={{marginBottom: 8, marginTop: 20}} level="2"
                   weight="medium">{selectedTeam?.name}</Title>
            </Gradient>
            <Group>
                <Header mode="secondary">Основная информация</Header>
                    <SimpleCell multiline>
                        <InfoRow header="Статус">
                            {statusTeam[selectedTeam?.status]}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell multiline>
                        <InfoRow header="Название">
                            {selectedTeam?.name}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell multiline>
                        <InfoRow header="Группа">
                            {selectedTeam?.group} - {institute[selectedTeam?.institute]} 
                        </InfoRow>
                    </SimpleCell>
                <Header mode="secondary">Участники</Header>
                <List>
                    {selectedTeam?.mates.map(user => (<Cell onClick={() => document.location.href = `https://vk.com/id${user.uid}`}  before={<Avatar size={44} src={user.photo}/>} description={user.uid == selectedTeam?.leader.uid && 'Капитан'} key={user.uid}>{user.vkUser || 'ещё не заходил'}</Cell>))}
                </List>
                <Header mode="secondary">Забег</Header>
                    {selectedTeam?.startAt && !selectedTeam?.finishAt && (
                        <>
                            <SimpleCell multiline>
                                <InfoRow header="Местонахождение">
                                    {selectedTeam?.substage ? 'на точке ' : 'решают загадку перед точкой '} {selectedTeam?.stage}
                                </InfoRow>
                            </SimpleCell>
                            <SimpleCell multiline>
                                <InfoRow header="Старт">
                                    {getTime(selectedTeam?.startAt)}
                                </InfoRow>
                            </SimpleCell>
                        </>
                    )}
                    {selectedTeam?.finishAt && <SimpleCell multiline>
                                <InfoRow header="Время забега">
                                    {timeFormat('hh ч. mm мин. ss с.', timeToDate(selectedTeam?.finishAt, selectedTeam?.startAt))}
                                </InfoRow>
                            </SimpleCell>}

                    
            </Group>
            
            <Group>
                {selectedTeam?.rates.length ? <CellButton onClick={handleOpenRate}>Посмотреть оценки команды</CellButton> : null}
                {selectedTeam?.status != 5 && store.appUser.role == 5 && <CellButton mode="danger" onClick={disqTeam.bind(this, selectedTeam?._id)}>Дисквалифицировать</CellButton>}
                {selectedTeam?.status == 5 &&  store.appUser.role == 5 && <CellButton mode="danger" onClick={rehabilTeam.bind(this, selectedTeam?._id)}>Реабилитировать</CellButton>}
            </Group>
        </ModalPage>
        <ModalPage id="selectPoint"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setSelectedUser(null)}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
              right={ selectedPoint && (
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setOrgPoint}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={setOrgPoint}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >Выберите точку 
		  </ModalPageHeader>}
        >
            {store.cycle 
            ? 
            <FormLayoutGroup top="Выберите точку">
                {store.cycle.map(point => (<Radio name="point" onClick={() => setSelectedPoint(point._id)} value={point._id}>{point.title}</Radio>))}
            </FormLayoutGroup>

            : 'Загружаем цикл...'}
        </ModalPage>
        <ModalPage id="searchTeam_rates"
        onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal('searchTeam_detailed')}}><Icon24BrowserBack /></PanelHeaderButton>}
				</Fragment>
			  )}>
                  {selectedTeam?.name}
		  </ModalPageHeader>}
        >
            {selectedTeam?.rates.map((rate, index) => (
                 <RichCell
                 disabled
                 multiline
                 before={<Avatar size={72} src={orgAvatars[index]} />}
                 text={rate.comment.length ? rate.comment[rate.comment.length - 1] : 'без комментария'}
                 caption={rate.comment.length > 1 ? 'Первый комментарий: ' + rate.comment[0] : rate.createAt}
                 after={rate.rate + ' ' + declOfNum(rate.rate, ['балл', 'балла', 'баллов'])}
                >
                     {rate.org.vkUser}({rate.point})
                </RichCell>
            ))}
            <Footer>
                {teamPoints} {declOfNum(teamPoints, ['балл', 'балла', 'баллов'])}
            </Footer>
        </ModalPage>
    </ModalRoot>)
	return (
        <View id="admin" activePanel="admin" modal={modals} popout={popout}>
            <Panel id={id}>
                <PanelHeader>
                    Админка
                </PanelHeader>
                <Group header={<Header mode="secondary">Тропа</Header>}>
                    { store.appUser.role == 5 && <SimpleCell expandable  before={<Icon16StarCircle size={28}/>} onClick={setActiveModal.bind(this, 'contests')}>Забеги</SimpleCell>}
                    <SimpleCell expandable  before={<Icon16StarCircle size={28}/>} onClick={store.goPage.bind(this, 'tasks')}>Цикл</SimpleCell>
                    {store.activeContest && <SimpleCell expandable before={<Icon24ScanViewfinderOutline size={28}/>} onClick={readQR}>Запустить/остановить команду</SimpleCell>}
                </Group>
                <Group header={<Header mode="secondary">Команды</Header>}>
                    {store.appUser.role == 5 && <SimpleCell expandable  before={<Icon24UserAdded size={28}/>} onClick={store.goPage.bind(this, 'teamList')}>Одобрение заявок</SimpleCell>}
                    <SimpleCell expandable  before={<Icon28Search size={28}/>} onClick={setActiveModal.bind(this, 'searchTeam')}>Информация о команде</SimpleCell>
                </Group>
                <Group header={<Header mode="secondary">Пользователи</Header>}>
                    <SimpleCell expandable  before={<Icon28User size={28}/>} onClick={setActiveModal.bind(this, 'searchUser')}>Информация о пользователе</SimpleCell>
                </Group>
                {store.appUser.role == 5 && <>
                    <Group header={<Header mode="secondary">Организаторы</Header>}>
                        <CellButton before={<Icon28ChevronDownOutline size={28} />} mode="danger" onClick={demoteAllOrgs}>Разжаловать всех организаторов</CellButton>
                    </Group>
                    <Group header={<Header mode="secondary">Модераторы</Header>}>
                        <CellButton before={<Icon28ChevronDownOutline size={28} />} mode="danger" onClick={demoteAllModers}>Разжаловать всех модераторов</CellButton>
                    </Group>
                </>}
                {snackbar}
            </Panel>
        </View>
)}));

export default AdminMenu;
