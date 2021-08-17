import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Group, Panel, RichCell, Button, Avatar } from '@vkontakte/vkui';
import axios from 'axios';
import { serverURL, access_token } from '../config'
import bridge from '@vkontakte/vk-bridge'

const TeamList = inject('store')(observer(({ id, store }) => {
    const [teams, setTeams] = useState([])
    const [avatars, setAvatars] = useState([])
    useEffect(() =>{
        store.togglePopout()
        axios.get(serverURL + 'teams/getUnconfirmed').then(data => {
           
            setTeams(data.data.teams)
            const leaders = data.data.teams.map(team => team.leader.uid)
            bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": leaders, "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
                setAvatars(d.response.map(r => ({ photo: r.photo_200, name: r.first_name + ' ' + r.last_name})))
                store.togglePopout()
            })
        }) 
    }, [avatars])
    const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
	return (<Panel id={id}>
        <Group>
            {teams.map((team, index) => (
                <RichCell
                disabled
                multiline
                before={<Avatar src={avatars[index].photo}/>}
                text={avatars[index].name}
                caption={institute[team.institute]}
                after={team.mates.length + ' чел.'}
                actions={
                <React.Fragment>
                    <Button>Принять</Button>
                    <Button mode="secondary">Отклонить</Button>
                </React.Fragment>
                }
                >
                {team.name}
                </RichCell>
            ))}
        </Group>
	</Panel>
)}));

export default TeamList;
