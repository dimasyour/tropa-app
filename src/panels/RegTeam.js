import React, { useState, useEffect } from 'react';

import bridge from '@vkontakte/vk-bridge';
import { inject, observer } from 'mobx-react'

import { Panel, PanelHeader, FormLayout, Group, Button, FormItem, Input, PanelHeaderBack, HorizontalScroll, HorizontalCell, Avatar, usePlatform, List, FormStatus } from '@vkontakte/vkui';
import { Icon20Users } from '@vkontakte/icons'
import { Icon12Cancel } from '@vkontakte/icons';
import axios from 'axios';
import { serverURL } from '../config';
import { set } from 'mobx';

const RegTeam = inject('store')(observer(({ id, store }) => {
    const [ nameTeam, setNameTeam ] = useState('')
    const [ num, setNum ] = useState('')
    const [ mates, setMates ] = useState([ store.vk_u ])
    const [ registered, setRegistered ] = useState(false)

    const [ status, setStatus ] = useState(null)
    
    const platform = usePlatform()

    const onChangeName = e => {
        setNameTeam(e.target.value)
    }
    const onChangeNum = e => {
        setNum(e.target.value)
    }

    const selectFriends = () => {
        bridge.send("VKWebAppGetFriends", { multi: true }).then(data => {
            const users = data.users.slice(0, 11)
            if(data.users.length > 11){
                setStatus({ type: 'warn', title: 'Достигнуто ограничение', text: 'Команда может состоять не более чем из 12 человек'})
            }
            setMates([store.vk_u ,...users])
        })
    }

    const createTeam = () => {
        store.togglePopout()
        axios.get(serverURL + 'teams/create',{
            params: {
                mates: mates.map(mate => mate.id).join(','),
                name: nameTeam,
                group: num,
                leader: store.vk_u.id
            }
        }).then((data) => {
            if(data){
                if(data.data.err){
                    return setStatus({title: 'Ошибка создания команды', text: data.data.text, type: 'error'})
                } else {
                    axios.get(serverURL + 'users',{
                        params: {
                            uid: store.vk_u.id
                        }
                    }).then((data) => {
                        const { user } = data.data
                        setStatus({title: 'Заявка отправлена', text: `Заявка будет рассмотрена организаторами. Вы получите уведомление о решении. Форма закроется через пару секунд`, type: 'success'})
                        store.updateAppUser(user)
                        setRegistered(true)
                        setTimeout(() => store.goPage('home'), 5000)
                    })
                }
            } else {
                setStatus({title: 'Ошибка создания команды', text: "Сервер не вернул ответ", type: 'error'})
            }
        })
        .catch(err => {
            setStatus({title: 'Ошибка создания команды', text: err.response?.data.text ?? 'Сервер не вернул ответ', type: 'error'})
        })
        .finally(() => {
            store.togglePopout()
        })
    }
    return (<Panel id={id}>
        <PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()}></PanelHeaderBack>}>
            Регистрация команды
        </PanelHeader>
        <Group>
            <FormLayout>
            <FormItem>
                {status && <FormStatus header={status.title} mode={status.type}>
                    {status.text}
                </FormStatus>}
            </FormItem>
                <FormItem
                top="Название команды"
                >
                    <Input 
                     type="nameTeam"
                     name="nameTeam"
                     value={nameTeam}
                     onChange={onChangeName}
                    />
                </FormItem>
                <FormItem
                top="Номер группы"
                >
                    <Input 
                     type="num"
                     name="num"
                     value={num}
                     onChange={onChangeNum}
                    />
                </FormItem>
                <FormItem top={<>Члены команды <Button style={{marginLeft: 8}} size="s" mode="outline" onClick={selectFriends} before={<Icon20Users/>}>Выбрать</Button></>}/>
                <Group>
                    <HorizontalScroll>
                        <div style={{display: 'flex'}}>
                            {
                                mates.map((mate, index) => 
                                (<HorizontalCell header={mate.first_name}><Avatar size={platform === 'ios' ? 64 : 56} src={mate.photo_200}/></HorizontalCell>))
                            }
                        </div>
                    </HorizontalScroll>
                </Group>
                <FormItem>
                    <Button size="l" stretched onClick={createTeam} disabled={registered}>Подать заявку</Button>
                </FormItem>
            </FormLayout>
        </Group>
	</Panel>
)}));

export default RegTeam;
