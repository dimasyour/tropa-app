import React from 'react';
import { inject, observer } from 'mobx-react'
import { getDate } from '../utils/func'

import Labirint from '../icons/Labirint'

import { Panel, PanelHeader, RichCell, List } from '@vkontakte/vkui';
const ContestList = inject('store')(observer(({ id, store }) => {
	
	return (<Panel id={id}>
		<PanelHeader>
			Забеги
		</PanelHeader>
		<List>
		{store.contestList.map(contest => (
			<RichCell
			key={contest._id}
			before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}
			caption={getDate(contest.date)}
			after="скоро">
				{contest.name}
			</RichCell>
		))}
		
		</List>
	</Panel>
)}));

export default ContestList;
