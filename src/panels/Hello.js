import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import Logo from '../icons/Logo'
import CustomPreloader from './components/CustomPreloader'
import { Panel, useAppearance } from '@vkontakte/vkui';

const Hello = inject('store')(observer(({ id, store }) => {
	const appearance = useAppearance()
	return (<Panel id={id}>
		<div style={{display: 'flex',justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '90vh'}}>
            <div style={{display: 'flex',justifyContent: 'space-around', alignItems: 'center', height: '600px',  flexDirection: 'column'}}>
				<Logo color={appearance ? `#4BB34B` : 'white'}/>
				<CustomPreloader  color={appearance ? `#4BB34B` : 'white'}/>
			</div>
        </div>
	</Panel>
)}));

export default Hello;
