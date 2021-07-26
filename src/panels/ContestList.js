import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { getDate } from '../utils/func'

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
			before={<Avatar size={48} src={logo}/>}
			caption={getDate(contest.date)}
			after="скоро">
				{contest.name}
			</RichCell>
		))}
		
		</List>
	</Panel>
)}));

export default ContestList;
