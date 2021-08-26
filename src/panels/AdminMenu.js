import React, { useEffect, useState, Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import { Panel, PanelHeader, Group, Header, SimpleCell, CellButton, ModalRoot, ModalPage, Input, FormLayout, FormItem, View, ModalPageHeader, PanelHeaderButton, usePlatform, ANDROID, VKCOM, IOS, Cell, Avatar, Gradient, Title, InfoRow } from '@vkontakte/vkui';
import { Icon16StarCircle, Icon28AddOutline, Icon28DeleteOutline   } from '@vkontakte/icons';
import { Icon28ChevronDownOutline, Icon24Cancel, Icon24Done, Icon24UserAdded, Icon28User, Icon28Search } from '@vkontakte/icons';
import axios from 'axios';
import useInput from './hooks/useInput';
import { serverURL, access_token } from '../config';
import bridge from '@vkontakte/vk-bridge'
import { set } from 'mobx';
const AdminMenu = inject('store')(observer(({ id, store }) => {
    const platform = usePlatform('')
    const [findInput, setFindInput] = useState('')
    const [activeModal, setActiveModal] = useState(null)
    const [usersFound, setUsersFound] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)


    const onChangeFindUser = (e) => setFindInput(e.target.value)
    const findUser = () => {
        axios.get( serverURL + 'users/find', { params: {
            req_u: findInput
        }}).then(data => {
            var users = data.data.users
            if(users){
                const ids = users.map(user => user.uid)
                bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": ids.join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200, screen_name"}}).then(data => {
                    users = users.map((user, index) => {user.photo = data.response[index].photo_200;user.screen_name = data.response[index].screen_name; return user})
                    setUsersFound(users)
                })
            }
            setActiveModal('searchUser_response')
        }).catch(err => {
            setActiveModal('searchUser_response')
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
    const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
	const modals = (<ModalRoot activeModal={activeModal}>
        <ModalPage id="searchUser"
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
			  right={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={findUser} disabled={findInput.length < 3}><Icon24Done /></PanelHeaderButton>}
				  {platform === IOS && <PanelHeaderButton onClick={findUser} disabled={findInput.length < 3}>Готово</PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Поиск пользователя
		  </ModalPageHeader>} >
            <FormLayout>
                <FormItem top="Кого ищем? Имя_Фамилия">
                    <Input value={findInput} onChange={onChangeFindUser}/>
                </FormItem>
            </FormLayout>
        </ModalPage>
        <ModalPage id="searchUser_response"
        settlingHeight={100}
        header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setFindInput('')}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Поиск пользователя
		  </ModalPageHeader>}
        >
            {usersFound.length && usersFound.map(user => (
                <Cell before={<Avatar src={user.photo}/>} onClick={() => {
                    setSelectedUser(user)
                    setActiveModal('searchUser_detailedUser');
                }}>
                    {user.vkUser}
                </Cell>
            ))}
        </ModalPage>
        <ModalPage id="searchUser_detailedUser"
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
                {selectedUser?.role < 3 && (<><Header mode="secondary">Команда</Header>
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
                {selectedUser?.role != 3 && <CellButton>Назначить организатором</CellButton>}
                {selectedUser?.role == 3 && <CellButton>Назначить точку</CellButton>}
                {selectedUser?.role == 3 && <CellButton mode="danger">Разжаловать организатора</CellButton>}
            </Group>
        </ModalPage>
    </ModalRoot>)
	return (
        <View id="admin" activePanel="admin" modal={modals}>
            <Panel id={id}>
                <PanelHeader>
                    Админка
                </PanelHeader>
                <Group header={<Header mode="secondary">Тропа</Header>}>
                    <SimpleCell expandable  before={<Icon16StarCircle size={28}/>} onClick={store.goPage.bind(this, 'tasks')}>Задания-точки</SimpleCell>
                </Group>
                <Group header={<Header mode="secondary">Команды</Header>}>
                    <SimpleCell expandable  before={<Icon24UserAdded size={28}/>} onClick={store.goPage.bind(this, 'teamList')}>Одобрение заявок</SimpleCell>
                    <SimpleCell expandable  before={<Icon28Search size={28}/>}>Информация о команде</SimpleCell>
                </Group>
                <Group header={<Header mode="secondary">Пользователи</Header>}>
                    <SimpleCell expandable  before={<Icon28User size={28}/>} onClick={setActiveModal.bind(this, 'searchUser')}>Информация о пользователе</SimpleCell>
                </Group>
                <Group header={<Header mode="secondary">Организаторы</Header>}>
                    <CellButton before={<Icon28ChevronDownOutline size={28} />} mode="danger">Разжаловать всех организаторов</CellButton>
                </Group>
            </Panel>
        </View>
)}));

export default AdminMenu;
