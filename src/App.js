import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, AdaptivityProvider, withAdaptivity, AppRoot, ConfigProvider, Epic, Tabbar, TabbarItem } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { io } from 'socket.io-client'
import { observer, Provider } from 'mobx-react'
import { Icon24Home,
	Icon28Users3Outline,
	Icon28CalendarOutline,
	Icon28UserCircleOutline } from '@vkontakte/icons'
	import { Icon24RobotOutline } from '@vkontakte/icons';
	import { Icon28CompassOutline } from '@vkontakte/icons';

import Home from './panels/Home';
import Hello from './panels/Hello'
import Start from './panels/Start';
import store from './store/store';
import RegTeam from './panels/RegTeam';
import AdminMenu from './panels/AdminMenu';
import Tasks from './panels/Tasks';

import '@vkontakte/vkui/dist/unstable.css' // CSS достаточно подключить один раз 
import MyTeam from './panels/MyTeam';
import ContestList from './panels/ContestList';
import TeamList from './panels/TeamList';


import './custom.css'

const App = () => {
	const [theme, setTheme] = useState('client_light')

  	const onStoryChange = (e) => store.goPage(e.currentTarget.dataset.story);
	  
	bridge.send("VKWebAppInit", {});
	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const theme = data.scheme ? data.scheme : 'client_light';
				setTheme(theme)
			}
		});
		bridge.send("VKWebAppSetViewSettings", theme == "client_light" ? {"status_bar_style": 'light', "status_bar_color": "#191919"} : {"status_bar_style": 'dark', "status_bar_color": "#ffffff"} );
	}, [theme])
	useEffect(() => {
		
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			store.setVkU(user)
			return user
		}
		fetchData().then(data => {
			store.getAppUser(data).then((res) => {
				if(res.data.user.team){
					store.goPage('home')
				} else {
					store.goPage('start')
				}
				store.setStatusApp(1)
			}).then(() => store.getContestList())
		})
	}, []);
	const menu = e => {
		if(e.state){
			if((store.activePage == 'home' && e.state.panel == 'start') || (store.activePage == 'home' && e.state.panel == 'reg')){
				window.history.pushState( { panel: 'home'}, `home` )
				return
			}
			store.goPage(e.state.panel)
		} else {
			if(store.activePage == 'start'){
				return
			}
			else if(store.activePage == 'reg'){
				store.goPage(`start`)
				window.history.pushState( { panel: 'start'}, `start` )
				return 
			} else {
				store.goPage(`home`)
				window.history.pushState( { panel: 'home'}, `home` )
			}
		}
	}
	useEffect(() => {
		var listener = e => e.preventDefault() & menu(e)
		window.addEventListener('popstate', listener)
		window.history.pushState({ panel: 'start'}, `start`)
		return () => {
			window.removeEventListener('popstate', listener)
		}
	}, [])
	return (
		<ConfigProvider scheme={theme}>
			<AdaptivityProvider>
				<AppRoot mode="full">
					<Provider store={store}>
					<Epic activeStory={store.activePage} tabbar={ store.activePage != 'hello' && store.activePage != 'start' && store.activePage != 'reg' && <Tabbar>
								<TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'contestList'}
								data-story="contestList"
								text="Забеги"
								><Icon28CalendarOutline /></TabbarItem>
								<TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'home'}
								data-story="home"
								text="Главная"
								><Icon28CompassOutline/></TabbarItem>
								{ store.appUser.team && store.appUser.role < 3 &&
									<TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'team'}
								data-story="team"
								text="Команда"
								><Icon28Users3Outline/></TabbarItem>
								}
								{ (store.appUser.role == 5 || true) && <TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'admin'}
								data-story="admin"
								text="Админка">
									<Icon24RobotOutline/>
									</TabbarItem>}
								
							</Tabbar>
							}>
							
							<View id="hello" activePanel="hello">
								<Hello id="hello"/>
							</View>
							<View id="start" activePanel="start">
								<Start id='start'/>
							</View>
							<View id="reg" activePanel="reg">
								<RegTeam id='reg'/>
							</View>
							
								
							
							<View id="contestList" activePanel="contestList">
								<ContestList id='contestList'/>
							</View>
							<View id="teamList" activePanel="teamList">
								<TeamList id='teamList'/>
							</View>

							
							<Home id='home'/>
							<MyTeam id='team'/>
							<Tasks id='tasks'/>
							<AdminMenu id='admin'/>
							{store.mainSnackbar}
						</Epic>
					</Provider>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
}

export default withAdaptivity(observer(App), {viewWidth: true});;
