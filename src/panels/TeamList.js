import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Group, Panel, RichCell, Button, Avatar, Link, PanelHeader, PanelHeaderButton, usePlatform, IOS, Placeholder, PanelHeaderContent, PanelHeaderContext, List, Cell, Counter } from '@vkontakte/vkui';
import axios from 'axios';
import { serverURL, access_token, service_key } from '../config'
import bridge from '@vkontakte/vk-bridge'
import { Icon28ChevronBack, Icon24Back, Icon16CheckCircleOutline, Icon16Dropdown, Icon24Done } from '@vkontakte/icons'
import { snackbarOk, snackbarErr } from '../utils/func'
import dayjs from 'dayjs';
import 'dayjs/locale/ru'

const TeamList = inject('store')(observer(({ id, store }) => {
    const osName = usePlatform()
    const [teams, setTeams] = useState([])
    const [avatars, setAvatars] = useState([])
    const [needUpdate, setNeedUpdate] = useState(false)
    const [snackbar, setSnackbar] = useState(null)
    const [contextOpened, setContextOpened] = useState(false)
    const [mode, setMode] = useState('all')
    const select = e => {
        setMode(e.currentTarget.dataset.mode)
        toggleContext()
    }
    const toggleContext = () => {
        setContextOpened(!contextOpened)
    }
    const sendNotify = (leader, message) => {
		bridge.send("VKWebAppCallAPIMethod", {"method": "notifications.sendMessage", "params": {"user_ids": leader, "v":"5.131", "random_id": new Date().getTime() , "access_token": service_key, "message": message}}).then(data => {
			console.log(data)
		})
	}
    useEffect(() =>{
        store.togglePopout()
        axios.get(serverURL + 'teams/getUnconfirmed').then(data => {
           if(data.data.teams.length){
                setTeams(data.data.teams)
                const leaders = data.data.teams.map(team => team.leader.uid)
                bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": leaders.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
                    setAvatars(d.response.map(r => ({ photo: r.photo_200, name: r.first_name + ' ' + r.last_name, id: r.id})))
                    store.togglePopout()
                })
           }
            
        }) 
    }, [needUpdate])
    const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
    const status = [
        'отклонена',
        'отложена',
        'на рассмотрении',
        'подтверждена'
    ]
    const updateStatus = (team ,status) => {
        store.togglePopout()
        axios.get(serverURL + 'teams/update', {
            params: { 
                type: 'status',
                teamId: team._id,
                newStatus: status
            }
        }).then(data => {
            snackbarOk(data.data.text, setSnackbar)
            setNeedUpdate(!needUpdate)
            if(status == 3){
                sendNotify(team.leader.uid, `Ваша заявка одобрена. Ждём вас на старте: ${dayjs(new Date(data.data.startTime)).locale('ru').format('DD MMMM в HH:mm')}`)
            }
        }).catch(err => {
            snackbarErr(err.message, setSnackbar)
        })
    }
	return (<Panel id={id}>
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
                  {['ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ'].map((inst, index) => {
                        const t = teams.filter(team => team.institute == index+1).length
                      return (<Cell
                      before={<Avatar style={{fontSize: 20, background: "#4BB34B", color: '#fff'}}>{index+1}</Avatar>}
                      after={mode === index+1 ? <Icon24Done fill="var(--accent)" /> : t ? <Counter mode="prominent">{t}</Counter> : null}
                      onClick={select}
                      data-mode={index+1}
                    >
                      {inst}
                    </Cell>
                  )})}
                </List>
              </PanelHeaderContext>
        <Group>
            {teams && mode == 'all' ? teams.map((team, index) => (
               
                    <RichCell
                    disabled
                    multiline
                    before={<Avatar src={avatars[index] ? avatars[index].photo : null}/>}
                    text={avatars[index] ? avatars[index].name : null}
                    caption={status[team.status]}
                    after={team.mates.length + ' чел.'}
                    actions={
                    <React.Fragment>
                        <Button onClick={updateStatus.bind(this, team, 3)}>Принять</Button>
                        {team.status == 2 && <Button onClick={updateStatus.bind(this, team, 1)} mode="secondary">Отложить</Button>}
                        {team.status > 0 && <Button onClick={updateStatus.bind(this, team, 0)} mode="destructive">Отклонить</Button>}
                    </React.Fragment>
                    }
                    >
                     <Link href={avatars[index] ?  '/' + avatars[index].id : null}>{team.name}({institute[team.institute]})</Link>
                    </RichCell>
                
            )) : teams.filter(team => team.institute == mode).map((team, index) => (
               
                <RichCell
                disabled
                multiline
                before={<Avatar src={avatars[index] ? avatars[index].photo : null}/>}
                text={avatars[index] ? avatars[index].name : null}
                caption={status[team.status]}
                after={team.mates.length + ' чел.'}
                actions={
                <React.Fragment>
                    <Button onClick={updateStatus.bind(this, team, 3)}>Принять</Button>
                    {team.status == 2 && <Button onClick={updateStatus.bind(this, team, 1)} mode="secondary">Отложить</Button>}
                    {team.status > 0 && <Button onClick={updateStatus.bind(this, team, 0)} mode="destructive">Отклонить</Button>}
                </React.Fragment>
                }
                >
                 <Link href={avatars[index] ?  '/' + avatars[index].id : null}>{team.name}({institute[team.institute]})</Link>
                </RichCell>
            
        ))}
            {
                !teams.length && <Placeholder icon={<Icon16CheckCircleOutline width={48} height={48}/>}>
                    Все заявки одобрены
                    </Placeholder>
            }
        </Group>
        {snackbar}
	</Panel>
)}));

export default TeamList;
