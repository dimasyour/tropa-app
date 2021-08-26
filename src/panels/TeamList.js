import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Group, Panel, RichCell, Button, Avatar, Link, PanelHeader, PanelHeaderButton, usePlatform, IOS, Placeholder } from '@vkontakte/vkui';
import axios from 'axios';
import { serverURL, access_token } from '../config'
import bridge from '@vkontakte/vk-bridge'
import { Icon28ChevronBack, Icon24Back, Icon16CheckCircleOutline} from '@vkontakte/icons'
import { snackbarOk, snackbarErr } from '../utils/func'

const TeamList = inject('store')(observer(({ id, store }) => {
    const osName = usePlatform()
    const [teams, setTeams] = useState([])
    const [avatars, setAvatars] = useState([])
    const [needUpdate, setNeedUpdate] = useState(false)
    const [snackbar, setSnackbar] = useState(null)
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
    const updateStatus = (teamId ,status) => {
        store.togglePopout()
        axios.get(serverURL + 'teams/update', {
            params: { 
                type: 'status',
                teamId: teamId,
                newStatus: status
            }
        }).then(data => {
            setSnackbar(snackbarOk(data.data.text))
            setNeedUpdate(!needUpdate)
        }).catch(err => {
            setSnackbar(snackbarErr(err.message))
        })
    }
	return (<Panel id={id}>
        <PanelHeader
        	left={<PanelHeaderButton onClick={() => window.history.back()}>
            {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
        </PanelHeaderButton>}>
            Заявки
        </PanelHeader>
        <Group>
            {teams && teams.map((team, index) => (
               
                    <RichCell
                    disabled
                    multiline
                    before={<Avatar src={avatars[index] ? avatars[index].photo : null}/>}
                    text={avatars[index] ? avatars[index].name : null}
                    caption={status[team.status]}
                    after={team.mates.length + ' чел.'}
                    actions={
                    <React.Fragment>
                        <Button onClick={updateStatus.bind(this, 3)}>Принять</Button>
                        {team.status == 2 && <Button onClick={updateStatus.bind(this, team._id, 1)} mode="secondary">Отложить</Button>}
                        {team.status > 0 && <Button onClick={updateStatus.bind(this, team._id, 0)} mode="destructive">Отклонить</Button>}
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
