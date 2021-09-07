import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { Icon28AddOutline, Icon16Done } from '@vkontakte/icons';
import { Icon16ErrorCircle } from '@vkontakte/icons';
import { Icon20Hand } from '@vkontakte/icons';
import axios from 'axios';
import { serverURL } from '../config';

import bridge from '@vkontakte/vk-bridge';

import { View, Panel, CellButton, Header, Group, Cell, Text, Avatar, List, RichCell, Alert, HorizontalCell, HorizontalScroll, PanelHeader, FormLayout, FormItem, Input, Button, Snackbar } from '@vkontakte/vkui';
import Status from './Status';

const MyTeam = inject('store')(observer(({ id, store }) => {
    const [newName, setNewName] = useState(store.appUser.team.name)
    const [popout, setPopout] = useState(null)
    const [snackbar, setSnackbar] = useState(null)

    const closePopout = () => setPopout(null)

    const selectFriends = () => {
        bridge.send("VKWebAppGetFriends", { multi: true }).then(data => {
            const users = data.users.slice(0, 11 - store.appUser.team.mates.length).map(user => user.id)
            return users
        }).then(users => {
            axios.get(serverURL + 'teams/update', {
                params: {
                    teamId: store.appUser.team._id,
                    mates: users.join(','),
                    action: 'add',
                    type: 'mates'
                }
            }).then(response => {
                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
                  >
                    {response.data.text}
                  </Snackbar>)
                  store.setAppUser(response.data.user)
            })
            .catch(err => {
                console.log(err)
                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
                  >
                    {err.response?.data.text ?? 'Ошибка запроса'}
                  </Snackbar>)
            })
        })
    }

    const removeMate = (id) => {

        axios.get(serverURL + 'teams/update', {
            params: {
                teamId: store.appUser.team._id,
                uid: id,
                action: 'remove',
                type: 'mates'
            }
        }).then(response => {
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
              >
                {response.data.text}
              </Snackbar>)
              store.setAppUser(response.data.user)
        })
        .catch(err => {
            console.log(err)
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
                {err.response?.data.text ?? 'Ошибка запроса'}
              </Snackbar>)
        })
    }

    const onDeletion = (id) => {
        setPopout(<Alert
            actions={[{
              title: 'Отмена',
              autoclose: true,
              mode: 'cancel'
            }, {
              title: 'Удалить',
              autoclose: true,
              mode: 'destructive',
              action: () => removeMate(id),
            }]}
            actionsLayout="horizontal"
            onClose={closePopout}
            header="Удаление документа"
            text="Вы уверены, что хотите удалить этот документ?"
          />)
    }

    const updateNameTeam = () => {
        axios.get(serverURL + 'teams/update', {
            params: {
                teamId: store.appUser.team._id,
                type: 'name',
                newName
            }
        }).then(response => {
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
              >
                {response.data.text}
              </Snackbar>)
              store.setAppUser(response.data.user)
        })
        .catch(err => {
            console.log(err)
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
                {err.response?.data.text ?? 'Ошибка запроса'}
              </Snackbar>)
        })
    }
    const onChangeValue = (e) => {
        setNewName(e.target.value)
    }
    const sendHi = () => {
        store.socket.emit('sayhi', {user: store.vk_u, team: store.appUser.team._id})
        store.socket.on('sayhi', (data) => {
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} src={data.user.photo_200}/>}
              >
               {`${data.user.first_name} ${data.user.last_name} обнял тебя`}
              </Snackbar>)
        })
    }
	return (
    <View popout={popout} id="team" activePanel="team">
        <Panel id={id}>
            <PanelHeader>
                Моя команда
            </PanelHeader>
            <Group>
                <RichCell
                before={<Avatar size={48} style={{background: store.appUser.team.color}} />}
                caption={`Заявка ${store.teamStatus}`}
            >
                
                {store.appUser.team.name}
                </RichCell>
            </Group>
            <Group header={<Header mode="secondary">Достижения</Header>}>
                <HorizontalScroll>
                    <div style={{display: 'flex'}}>
                        {[0,0,0,0,0,0,0,0].map((item, index) => (
                            <HorizontalCell header={`Точка ${index+1}`}>
                                <Avatar size={64} mode='app'/>
                            </HorizontalCell>
                        ))}
                    </div>
                </HorizontalScroll>
            </Group>
            {store.socket ? <Group>
                <Cell after={store.socketStatus}>
                    Статус сервера
                </Cell>
            </Group> : null}
            
            {store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1 &&  store.appUser.team.status < 2 && <Group header={<Header mode="secondary">Основная информация</Header>}>
                <FormLayout>
                    {store.appUser.team.status == 1 && <FormItem>
                        <Text weight="regular">Изменение названия команды будет доступно до одобрения заявки</Text>
                    </FormItem>}
                    {store.appUser.team.status == 0 && <FormItem>
                        <Text weight="regular">Заявка была отложена. Измените пожалуйста название своей команды</Text>
                    </FormItem>}
                    <FormItem top="Название команды">
                        <Input type="text" defaultValue={store.appUser.team.name} onChange={onChangeValue}/>
                    </FormItem>
                    { newName != store.appUser.team.name && <FormItem>
                        <Button stretched onClick={updateNameTeam}>Изменить</Button>
                    </FormItem>}
                </FormLayout>
            </Group>}
            <Group header={<Header mode="secondary">Участники</Header>}>
                    <List>
                        {store.vk_mates.map((item) => (
                        <Cell removable={ item.id != store.appUser.team.leader.uid && store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1} onRemove={() => onDeletion(store.appUser.team.mates.filter(i => i.uid == item.id).pop()._id)} description={item.id == store.appUser.team.leader.uid && 'Капитан'} before={<Avatar size={44} src={item.photo_200}/>} key={item.uid} >{item.first_name} {item.last_name}</Cell>
                        ))}
                        {store.appUser.team.mates.length < 12 && store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1 && <CellButton onClick={selectFriends} before={<Avatar shadow={false} size={44}><Icon28AddOutline /></Avatar>}>Добавить участников</CellButton>}
                    </List>
            </Group>
            {snackbar}
        </Panel>
    </View>
)}));

export default MyTeam;
