import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, AdaptivityProvider, withAdaptivity, AppRoot, ConfigProvider, Epic, Tabbar, TabbarItem, withPlatform } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { observer, Provider } from 'mobx-react'
import { 
	Icon28Users3Outline,
	Icon28CalendarOutline,
	Icon28InfoCircleOutline,
	Icon24RobotOutline,
	Icon28CompassOutline } from '@vkontakte/icons'
	
import Home from './panels/Home';
import Hello from './panels/Hello'
import Start from './panels/Start';
import store from './store/store';
import RegTeamGen from './panels/RegTeamGen';
import RegTeam from './panels/RegTeam';
import AdminMenu from './panels/AdminMenu';
import Tasks from './panels/Tasks';

import '@vkontakte/vkui/dist/unstable.css' // CSS достаточно подключить один раз 
import MyTeam from './panels/MyTeam';
import ContestList from './panels/ContestList';
import TeamList from './panels/TeamList';


import './custom.css'
import Info from './panels/Info';

const App = ({ platform }) => {
	const [theme, setTheme] = useState('bright_light')

  	const onStoryChange = (e) => store.goPage(e.currentTarget.dataset.story);
	  
	bridge.send("VKWebAppInit", {});
	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const theme = data.scheme ? data.scheme : 'bright_light';
				setTheme(theme)
			} else if( type == 'VKWebAppViewHide'){
				store.socket.disconnect();
			} else if( type == 'VKWebAppViewRestore'){
				store.socket.connect()
			}
		});
	}, [])
	useEffect(() => {
		
		if(store.activePage == 'start'){
			bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#4BB34B"});
		} else {
			bridge.send("VKWebAppSetViewSettings", theme == "bright_light" ? {"status_bar_style": 'dark', "action_bar_color": "#ffffff"} : {"status_bar_style": 'light', "action_bar_color": "#191919"} );
		}
	}, [theme, store.activePage])
	useEffect(() => {
		
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			store.setVkU(user)
			return user
		}
		fetchData().then(data => {
			store.getAppUser(data).then((res) => {
				if(res.data.user.team || res.data.user.role > 2){
					store.goPage('home')
				} else {
					store.goPage('start')
				}
				store.setStatusApp(1)
			}).then(() => store.getContestList())
		})
		if(store.appUser){
			if(store.appUser.team && store.teamContest){
				if(!store.appUser.team.stage){
					store.setStartPosition()
				}
			}
		}
		
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
		<ConfigProvider scheme={theme} platform={platform}>
			<AdaptivityProvider>
				<AppRoot mode="full">
					<Provider store={store}>
					<Epic activeStory={store.activePage} tabbar={ store.activePage != 'hello' && store.activePage != 'start' && store.activePage != 'reg'  && store.activePage != 'regGen' && <Tabbar>
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
								
								<TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'info'}
								data-story="info"
								text="Информация"
								><Icon28InfoCircleOutline/></TabbarItem>
								{ (store.appUser.role > 3) && <TabbarItem
								onClick={onStoryChange}
								selected={store.activePage === 'admin'}
								data-story="admin"
								text={store.appUser.role == 4 ? 'Модер' : 'Админка'}>
									<Icon24RobotOutline/>
									</TabbarItem>}
								
							</Tabbar>
							}>
							
							<View id="hello" activePanel="hello">
								<Hello id="hello"/>
							</View>
							<View id="start" activePanel="start">
								<Start id='start' theme={theme}/>
							</View>
							
							<RegTeam id='reg'/>
							<RegTeamGen id='regGen'/>
							<ContestList id='contestList'/>
							<TeamList id='teamList'/>
							<Info id='info'/>
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

export default withPlatform(withAdaptivity(observer(App), {viewWidth: true}));;
