import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'

import { Panel } from '@vkontakte/vkui';

const Hello = inject('store')(observer(({ id, store }) => {
	return (<Panel id={id}>
		<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh'}}>
            <span>Загружаем приложение...</span>
        </div>
	</Panel>
)}));

export default Hello;
