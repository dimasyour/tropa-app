import React from 'react';
import { inject, observer } from 'mobx-react'

import { Icon28BookmarkOutline, Icon20HelpOutline, Icon24BroadcastOutline, Icon24MessageOutline } from '@vkontakte/icons'
import { Panel, PanelHeader, Group, Cell, Header } from '@vkontakte/vkui';
const Info = inject('store')(observer(({ id, store }) => {
	
	return (<Panel id={id}>
		<PanelHeader separator={false}>
			Информация
		</PanelHeader>
        <Group header={<Header mode="secondary">Забег</Header>}>
            <Cell before={<Icon24BroadcastOutline width={28} height={28}/>} after={store.socketStatus}>
                        Статус сервера
            </Cell>
            <Cell before={<Icon20HelpOutline width={28} height={28}/>}>
                Правила
            </Cell>
        </Group>
        <Group header={<Header mode="secondary">Поддержка</Header>}>
            <Cell before={<Icon24MessageOutline width={28} height={28}/>}>
                Связь с организаторами
            </Cell>
            <Cell before={<Icon28BookmarkOutline/>}>
                Об организаторах
            </Cell>
        </Group>
	</Panel>
)}));

export default Info;
