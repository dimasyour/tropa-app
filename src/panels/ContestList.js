import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { getDate } from '../utils/func'

import Labirint from '../icons/Labirint'

import { Panel, PanelHeader, RichCell, List, Avatar } from '@vkontakte/vkui';

import logo from '../img/logo.jpg'

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
