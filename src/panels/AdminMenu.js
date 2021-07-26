import React, {useEffect} from 'react';
import { inject, observer } from 'mobx-react'
import { Panel, PanelHeader, Group, Header, SimpleCell, CellButton } from '@vkontakte/vkui';
import { Icon16StarCircle, Icon28AddOutline, Icon28DeleteOutline   } from '@vkontakte/icons';
import { Icon28ChevronDownOutline } from '@vkontakte/icons';
import { Icon24UserAdded } from '@vkontakte/icons';
import { Icon28User } from '@vkontakte/icons';
import { Icon28Search } from '@vkontakte/icons';
const AdminMenu = inject('store')(observer(({ id, store }) => {
	
	return (<Panel id={id}>
		<PanelHeader>
			Админка
		</PanelHeader>
		<Group header={<Header mode="secondary">Тропа</Header>}>
            <SimpleCell expandable  before={<Icon16StarCircle size={28}/>} onClick={store.goPage.bind(this, 'tasks')}>Задания-точки</SimpleCell>
        </Group>
        <Group header={<Header mode="secondary">Команды</Header>}>
            <SimpleCell expandable  before={<Icon24UserAdded size={28}/>}>Одобрение заявок</SimpleCell>
            <SimpleCell expandable  before={<Icon28Search size={28}/>}>Информация о команде</SimpleCell>
        </Group>
        <Group header={<Header mode="secondary">Участники</Header>}>
            <SimpleCell expandable  before={<Icon28User size={28}/>}>Информация об участнике</SimpleCell>
        </Group>
        <Group header={<Header mode="secondary">Организаторы</Header>}>
            <SimpleCell expandable  before={<Icon16StarCircle size={28}/>}>Информация об организаторе</SimpleCell>
            <CellButton before={<Icon28AddOutline  size={28}/>}>Добавить организатора</CellButton>
            <CellButton before={<Icon28ChevronDownOutline size={28} />} mode="danger">Разжаловать организатора</CellButton>
        </Group>
	</Panel>
)}));

export default AdminMenu;
