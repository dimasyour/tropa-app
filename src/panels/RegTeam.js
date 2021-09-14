import React, { useState, useEffect, Fragment, useCallback } from 'react';

import bridge from '@vkontakte/vk-bridge';
import { inject, observer } from 'mobx-react'

import { Panel, PanelHeader, FormLayout, Group, Button, FormItem, Input, PanelHeaderBack, HorizontalScroll, HorizontalCell, Avatar, usePlatform, List, FormStatus, ANDROID, View, ModalRoot, ModalPage, ModalPageHeader, PanelHeaderButton, VKCOM, IOS, Cell,  } from '@vkontakte/vkui';
import { Icon20Users, Icon24Done, Icon24Cancel } from '@vkontakte/icons'
import axios from 'axios';
import { serverURL, service_key, app_id } from '../config';

const RegTeam = inject('store')(observer(({ id, store }) => {
    const [ nameTeam, setNameTeam ] = useState('')
    const [activeModal, setActiveModal] = useState(null)
    const [ num, setNum ] = useState('')
    const [ mates, setMates ] = useState([ store.vk_u ])
    const [ registered, setRegistered ] = useState(false)
    const [ friends, setFriends] = useState([])
    const [ selected, setSelected] = useState([])

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
            }).catch(err => console.log(err))
       
    }

    useEffect(() => {
        if(platform != ANDROID){
            bridge.send("VKWebAppGetAuthToken", {"app_id": app_id, "scope": "friends"}).then(data => {
                bridge.send("VKWebAppCallAPIMethod", {"method": "friends.get", "params": {"user_id": store.appUser.uid, "v":"5.131", "access_token": data.access_token, "order": "name", "fields": "photo_200"}}).then(data => {
                    setFriends(data.response.items)
                 })
            }).catch(() => {
                bridge.send("VKWebAppCallAPIMethod", {"method": "friends.get", "params": {"user_id": store.appUser.uid, "v":"5.131", "access_token": service_key, "order": "name", "fields": "photo_200"}}).then(data => {
                    setFriends(data.response.items)
                 })
            });
                
        }
    }, [])
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
                    return setStatus({title: 'Ошибка создания команды', text: `${data.data.text}`, type: 'error'})
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


    const handleSelectFriend = friend => {
        const index = selected.findIndex(sel => sel.id == friend.id)
        if(index != -1){
            const copy = Array.from(selected)
            copy.splice(index, 1)
            setSelected([...copy])
        } else {
            setSelected([...selected, friend])
        }
    }
    const addTeamates = () => {
        if(selected.length > 11){
            const m = selected.slice(0,11)
            setStatus({ type: 'warn', title: 'Достигнуто ограничение', text: 'Команда может состоять не более чем из 12 человек'})
            setMates([store.vk_u, ...m])
        } else {
            setMates([store.vk_u, ...selected])
        }
        setSelected([])
        setActiveModal(null)
    }

    const modalRoot = <ModalRoot activeModal={activeModal}>
        <ModalPage
        id="selectFriends"
        settlingHeight={100}
        onClose={setActiveModal.bind(this, null)}
        header={<ModalPageHeader
            left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
                  {platform === IOS && <PanelHeaderButton onClick={() => setActiveModal(null)}>Назад</PanelHeaderButton>}
				</Fragment>
			  )}
			  right={  (
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => addTeamates()}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={() => addTeamates()}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
        >{`${friends.length} друзей`}</ModalPageHeader>}
        >
            <List>
            {friends.map(friend => <Cell key={friend.id} selectable onChange={() => handleSelectFriend(friend)} before={<Avatar src={friend.photo_200} />}>{friend.first_name} {friend.last_name}</Cell>)}
            </List>
        </ModalPage>
    </ModalRoot>
    return (
        <View id="reg" activePanel="reg" modal={modalRoot}>
            <Panel id={id}>
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
                        <FormItem top={<>Члены команды <Button style={{marginLeft: 8}} size="s" mode="outline" onClick={ platform == ANDROID ? selectFriends : setActiveModal.bind(this, 'selectFriends')} before={<Icon20Users/>}>Выбрать</Button></>}/>
                        <Group>
                            <HorizontalScroll>
                                <div style={{display: 'flex'}}>
                                    {
                                        mates.map((mate, index) => 
                                        (<HorizontalCell key={mate.id} header={mate.first_name}><Avatar size={platform === 'ios' ? 64 : 56} src={mate.photo_200}/></HorizontalCell>))
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
    </View>
)}));

export default RegTeam;
