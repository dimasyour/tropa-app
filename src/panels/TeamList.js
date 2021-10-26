import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Group, Panel, RichCell, Button, Avatar, Link, PanelHeader, PanelHeaderButton, usePlatform, IOS, Placeholder, PanelHeaderContent, PanelHeaderContext, List, Cell, Counter, View, ModalRoot, ModalPage, ModalPageHeader, VKCOM, ANDROID, Gradient, SimpleCell, Title, Header, InfoRow, CellButton } from '@vkontakte/vkui';
import axios from 'axios';
import { serverURL, access_token, service_key } from '../config'
import bridge from '@vkontakte/vk-bridge'
import { Icon28ChevronBack, Icon24Back, Icon16CheckCircleOutline, Icon16Dropdown, Icon24Done, Icon24Cancel, Icon24ClockOutline, Icon24CheckCircleOutline, Icon28CancelCircleOutline } from '@vkontakte/icons'
import dayjs from 'dayjs';
import 'dayjs/locale/ru'
import TeamAvatar from './components/TeamAvatar';
import { snackbarOk, snackbarErr } from '../utils/func'

const TeamList = inject('store')(observer(({ id, store }) => {
    const osName = usePlatform()
    const [teams, setTeams] = useState([])
    const [avatars, setAvatars] = useState([])
    const [needUpdate, setNeedUpdate] = useState(false)
    const [snackbar, setSnackbar] = useState(null)
    const [contextOpened, setContextOpened] = useState(false)
    const [mode, setMode] = useState('all')
    const [activeModal, setActiveModal] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState(null)
    const platform = usePlatform()
    const select = e => {
        setMode(e.currentTarget.dataset.mode)
        toggleContext()
    }
    const toggleContext = () => {
        setContextOpened(!contextOpened)
    }
    const sendNotify = (leader, message) => {
		bridge.send("VKWebAppCallAPIMethod", {"method": "notifications.sendMessage", "params": {"user_ids": leader, "v":"5.131", "random_id": new Date().getTime() , "access_token": service_key, "message": message}}).then(data => {
			
		})
	}
    useEffect(() =>{
        store.togglePopout()
        store.socket.emit('admin:get_unconfirmed') 
        store.socket.on('admin:get_unconfirmed', data => {
            if(data.teams){
                const leaders = data.teams.map(team => team.leader.uid)
                bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": leaders.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
                    const ct = data.teams.map((team, ind) => {
                        team = { ...team, photo: d.response[ind].photo_200, leadName: d.response[ind].first_name + ' ' + d.response[ind].last_name, id: d.response[ind].id}
                        return team
                    })
                    setTeams(ct)
                    store.togglePopout()
                })
            }
        }) 
    }, [])
    const handleTeam = team => {
        let mates = team.mates.map(mate => mate.uid)
        bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": mates.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
            mates = d.response.map(user => {
                let u = {  photo: user.photo_200, username: user.first_name + ' ' + user.last_name, id: user.id}
                return u
            })
            team.mates = mates
            setSelectedTeam(team)
            setActiveModal('approveTeam')
        })
    }
    const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
    institute[15] = 'поколения(день 1)'
    institute[16] = 'поколения(день 2)'
    institute[20] = 'финалисты'
    const status = [
        'отклонена',
        'отложена',
        'на рассмотрении',
        'подтверждена'
    ]
    const updateStatus = (team ,status) => {
        store.socket.emit('admin:update_status', { teamId: team._id, newStatus: status })
        store.socket.on('admin:updated_status', data => {
            
            if(status == 3){
                sendNotify(team.leader.uid, `Ваша заявка одобрена. Ждём вас на старте: ${dayjs(new Date(data.startTime)).locale('ru').format('DD MMMM в HH:mm')}`)
            }
            store.socket.emit('admin:get_unconfirmed') 
            setActiveModal(null)
            snackbarOk(data.text, setSnackbar)
        })
        
    }
    const final = teams.filter(team => team.role.includes(20)).length
    const gen = teams.filter(team => team.role.includes(15)).length

    const modalRoot = (<ModalRoot activeModal={activeModal}>
        <ModalPage id="approveTeam"
        onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
            >Заявка</ModalPageHeader>}
        settlingHeight={100}
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
                            {status[selectedTeam?.status]}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell multiline>
                        <InfoRow header="Название">
                            {selectedTeam?.name}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell multiline>
                        <InfoRow header="Группа">
                            {selectedTeam?.group ?? 'не указана'} - {institute[selectedTeam?.institute]} 
                        </InfoRow>
                    </SimpleCell>
                <Header mode="secondary">Участники</Header>
                <List>
                    {selectedTeam?.mates.map(user => (<Cell onClick={() => document.location.href = `https://vk.com/id${user.id}`}  before={<Avatar size={44} src={user.photo}/>} description={user.id == selectedTeam?.leader.uid && 'Капитан'} key={user.uid}>{user.username}</Cell>))}
                </List>
                <Header mode="secondary">Действия</Header>
                <CellButton before={<Icon24CheckCircleOutline width={28} height={28}/>} onClick={() => updateStatus(selectedTeam, 3)}>Одобрить</CellButton>
                {selectedTeam?.status != 1 && <CellButton before={<Icon24ClockOutline width={28} height={28}/>} onClick={() => updateStatus(selectedTeam, 1)}>Отложить</CellButton>}
                {selectedTeam?.status != 0 && <CellButton before={<Icon28CancelCircleOutline/>}  mode="danger" onClick={() => updateStatus(selectedTeam, 0)}>Отклонить</CellButton>}
            </Group>
            {/* {JSON.stringify(selectedTeam)} */}
        </ModalPage>
    </ModalRoot>)

	return (
    <View id="teamList" activePanel="teamList" modal={modalRoot}>
    <Panel id={id}>
        <PanelHeader
        	left={<PanelHeaderButton onClick={() => window.history.back()}>
            {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
        </PanelHeaderButton>}>
        <PanelHeaderContent
                  aside={<Icon16Dropdown style={{ transform: `rotate(${contextOpened ? '180deg' : '0'})` }} />}
                  onClick={toggleContext}
                >
                  {mode != 'all' ? institute[mode] : 'Все заявки'}
                </PanelHeaderContent>
        </PanelHeader>
        <PanelHeaderContext opened={contextOpened} onClose={toggleContext}>
                <List>
                  <Cell
                    before={<Avatar style={{fontSize: 20, background: "#4BB34B", color: 'white'}}>0</Avatar>}
                    after={mode === 'all' ? <Icon24Done fill="var(--accent)" /> : <Counter mode="prominent">{teams.length}</Counter>}
                    onClick={select}
                    data-mode="all"
                  >
                    Все
                  </Cell>
                  {/* {['ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ'].map((inst, index) => {
                        const t = teams.filter(team => team.institute == index+1).length
                      return (<Cell
                      before={<Avatar style={{fontSize: 20, background: "#4BB34B", color: '#fff'}}>{index+1}</Avatar>}
                      after={mode === index+1 ? <Icon24Done fill="var(--accent)" /> : t ? <Counter mode="prominent">{t}</Counter> : null}
                      onClick={select}
                      data-mode={index+1}
                    >
                      {inst}
                    </Cell>
                  )})} */}
                    <Cell
                      before={<Avatar style={{fontSize: 20, background: "#4BB34B", color: '#fff'}}>ЗП</Avatar>}
                      after={mode === 15 ? <Icon24Done fill="var(--accent)" /> : gen ? <Counter mode="prominent">{gen}</Counter> : null}
                      onClick={select}
                      data-mode={15}
                    >
                      Поколения
                    </Cell>
                    <Cell
                      before={<Avatar style={{fontSize: 20, background: "#4BB34B", color: '#fff'}}>Ф</Avatar>}
                      after={mode === 20 ? <Icon24Done fill="var(--accent)" /> : final ? <Counter mode="prominent">{final}</Counter> : null}
                      onClick={select}
                      data-mode={20}
                    >
                      Финалисты
                    </Cell>
                </List>
              </PanelHeaderContext>
        <Group>
            {teams && mode == 'all' ? teams.map((team, index) => (
               
                    <RichCell
                    disabled
                    multiline
                    before={<Avatar src={team.photo ?? null}/>}
                    text={team.leadName ?? null}
                    caption={status[team.status]}
                    after={team.mates.length + ' чел.'}
                    actions={
                    <React.Fragment>
                        <Button mode="secondary" onClick={handleTeam.bind(this, team)}>Обработать</Button>
                    </React.Fragment>
                    }
                    >
                     <Link href={avatars[index] ?  '/' + avatars[index].id : null}>{team.name}({institute[team.institute]})</Link>
                    </RichCell>
                
            )) : mode == 15 ?
            teams.filter(team => team.role.includes(15)).map((team, index) => (
               
                <RichCell
                disabled
                multiline
                before={<Avatar src={team.photo ?? null}/>}
                text={team.leadName  ?? null}
                caption={status[team.status]}
                after={team.mates.length + ' чел.'}
                actions={
                <React.Fragment>
                    <Button mode="secondary" onClick={handleTeam.bind(this, team)}>Обработать</Button>
                </React.Fragment>
                }
                >
                 <Link href={avatars[index] ?  '/' + avatars[index].id : null}>{team.name}({institute[team.institute]})</Link>
                </RichCell>
            
        )) : teams.filter(team => team.role.includes(20)).map((team, index) => (
               
            <RichCell
            disabled
            multiline
            before={<Avatar src={team.photo ?? null}/>}
            text={team.leadName  ?? null}
            caption={status[team.status]}
            after={team.mates.length + ' чел.'}
            actions={
            <React.Fragment>
                <Button mode="secondary" onClick={handleTeam.bind(this, team)}>Обработать</Button>
            </React.Fragment>
            }
            >
             <Link href={avatars[index] ?  '/' + avatars[index].id : null}>{team.name}({institute[team.institute]})</Link>
            </RichCell>
        
    ))
        }
            {
                !teams.length && <Placeholder icon={<Icon16CheckCircleOutline width={48} height={48}/>}>
                    Все заявки одобрены
                    </Placeholder>
            }
        </Group>
        {snackbar}
	</Panel>
    </View>
)}));

export default TeamList;
