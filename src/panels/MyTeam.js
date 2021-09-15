import React, {useState,useEffect, Fragment} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { Icon28AddOutline, Icon16Done } from '@vkontakte/icons';
import { Icon16ErrorCircle } from '@vkontakte/icons';
import { Icon20Hand, Icon24Done, Icon24Cancel } from '@vkontakte/icons';
import axios from 'axios';
import { serverURL, app_id } from '../config';

import bridge from '@vkontakte/vk-bridge';

import { View, Panel, CellButton, Header, Group, Cell, Text, Avatar, List, RichCell, Alert, HorizontalCell, HorizontalScroll, PanelHeader, FormLayout, FormItem, Input, Button, Snackbar, ModalRoot, ModalPage, ModalPageHeader, usePlatform, ANDROID, VKCOM, IOS, PanelHeaderButton } from '@vkontakte/vkui';
import Status from './Status';
import TeamAvatar from './components/TeamAvatar';

const MyTeam = inject('store')(observer(({ id, store }) => {
    const [newName, setNewName] = useState(store.appUser.team.name)
    const [popout, setPopout] = useState(null)
    const [activeModal, setActiveModal] = useState(null)
    const [snackbar, setSnackbar] = useState(null)
    const [friends, setFriends] = useState([])
    const [selected, setSelected] = useState([])

    const closePopout = () => setPopout(null)

    const platform = usePlatform()
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
                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
                  >
                    {err.response?.data.text ?? 'Ошибка запроса'}
                  </Snackbar>)
            })
        })
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
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
                {err.response?.data.text ?? 'Ошибка запроса'}
              </Snackbar>)
        })
    }

    const onDeletion = ({ sex, name, id}) => {
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
            header="Удаление участника"
            text={`${name} будет ${sex == 1 ? 'удалена' : 'удалён'} из списка участников твоей команды. Ты уверен в этом?`}
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
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
                {err.response?.data.text ?? 'Ошибка запроса'}
              </Snackbar>)
        })
        setNewName('')
    }
    const onChangeValue = (e) => {
        setNewName(e.target.value)
    }

    const addTeamates = () => {
        axios.get(serverURL + 'teams/update', {
            params: {
                teamId: store.appUser.team._id,
                mates: selected.map(sel => sel.id).join(','),
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
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
                {err.response?.data.text ?? 'Ошибка запроса'}
              </Snackbar>)
        })
        .then(() => {
            setActiveModal(null)
            setSelected([])
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
    <View popout={popout} id="team" activePanel="team" modal={modalRoot}>
        <Panel id={id}>
            <PanelHeader>
                Моя команда
            </PanelHeader>
            <Group>
                <RichCell
                before={<TeamAvatar team={store.appUser.team}/>}
                caption={`Заявка ${store.teamStatus}`}
            >
                
                {store.appUser.team.name}
                </RichCell>
            </Group>
            {/* <Group header={<Header mode="secondary">Достижения</Header>}>
                <HorizontalScroll>
                    <div style={{display: 'flex'}}>
                        {[0,0,0,0,0,0,0,0].map((item, index) => (
                            <HorizontalCell header={`Точка ${index+1}`}>
                                <Avatar size={64} mode='app'/>
                            </HorizontalCell>
                        ))}
                    </div>
                </HorizontalScroll>
            </Group> */}
            
            {store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1 &&  store.appUser.team.status < 3 && <Group header={<Header mode="secondary">Основная информация</Header>}>
                <FormLayout>
                    {store.appUser.team.status == 2 && <FormItem>
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
                        <Cell removable={ item.id != store.appUser.team.leader.uid && store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1} onRemove={() => onDeletion({sex: item.sex,name: `${item.first_name} ${item.last_name}`, id: store.appUser.team.mates.filter(i => i.uid == item.id).pop()._id})} description={item.id == store.appUser.team.leader.uid && 'Капитан'} before={<Avatar size={44} src={item.photo_200}/>} key={item.uid} >{item.first_name} {item.last_name}</Cell>
                        ))}
                        {store.appUser.team.mates.length < 12 && store.activeContest?.institute != store.appUser.team.institute && store.appUser.role == 1 && <CellButton onClick={platform != ANDROID ? setActiveModal.bind(this, 'selectFriends') : selectFriends} before={<Avatar shadow={false} size={44}><Icon28AddOutline /></Avatar>}>Добавить участников</CellButton>}
                    </List>
            </Group>
            {snackbar}
        </Panel>
    </View>
)}));

export default MyTeam;
