import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import { getDate } from '../utils/func'
import { Icon36Users3Outline, Icon28CalendarOutline, Icon24ClockOutline, Icon16ChevronOutline, Icon24Cancel } from '@vkontakte/icons';

import Labirint from '../icons/Labirint'

import { View, Panel, PanelHeader, PanelHeaderButton, ModalPageHeader, RichCell, List, Tabs, TabsItem, Group, Div, Placeholder, ModalRoot, ModalPage, usePlatform, VKCOM, ANDROID, IOS } from '@vkontakte/vkui';
const ContestList = inject('store')(observer(({ id, store }) => {
	const platform = usePlatform()
	const [ activeTab, setActiveTab ] = React.useState('future')
	const [ activeModal, setActiveModal ] = React.useState(null)
	const [ selectedContest, setSelectedContest ] = React.useState({})

	const lastContest = store.contestList.filter(contest => contest.status == 2)
	const futureContest = store.contestList.filter(contest => contest.status == 0)
	
	const modalRoot = (<ModalRoot activeModal={activeModal}>
		<ModalPage id='result' 
		settlingHeight={100}
		onClose={() => setActiveModal(null)}
        settlingHeight={100}
        header={<ModalPageHeader
        
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			{selectedContest?.name}
		  </ModalPageHeader>} >
			  {selectedContest.results ? <List>
					{selectedContest?.results.map((team, index) => (
						<Div>
							{`${index+1} ${team.name}`}
						</Div>
					))}
					
				</List> :
				<Placeholder
				icon={<Icon24ClockOutline width={70} height={70} />}>
					Результаты ещё не загрузились
				</Placeholder>}
				
		</ModalPage>
	</ModalRoot>)

	return (
		<View id="contestList" activePanel="contestList" modal={modalRoot}>
			<Panel id={id}>
				<PanelHeader separator={false}>
					Забеги
				</PanelHeader>

				<Group>
					<Tabs>
						<TabsItem
						onClick={setActiveTab.bind(this, 'future')}
						selected={activeTab === 'future'}
						>
						Будущие
						</TabsItem>
						<TabsItem
						onClick={setActiveTab.bind(this, 'last')}
						selected={activeTab === 'last'}
						>
						Прошедшие
						</TabsItem>
					</Tabs>
					{activeTab == 'future' &&
						<List>
						{futureContest.length ? futureContest.map(contest => (
							<RichCell
							key={contest._id}
							before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}
							caption={getDate(contest.date)}>
								{contest.name} {store.appUser.team ? store.teamContest._id == contest._id ? <Icon36Users3Outline width={20} height={20} style={{display: 'inline-block'}}/> : null : null}
							</RichCell>
						)) :  
						<Placeholder
					icon={<Icon28CalendarOutline width={70} height={70} />}
					>
					Все забеги завершились
					</Placeholder>
						}
						
						</List>}
						{activeTab == 'last' &&
						<List>
						{lastContest.length ? lastContest.map(contest => (
							<RichCell
							key={contest._id}
							before={<div style={{display: 'flex', alignItems: 'center', marginRight: 10}}><Labirint/></div>}
							caption={getDate(contest.date)}
							after={<Icon16ChevronOutline width={24} height={24}/>}
							onClick={() => { setSelectedContest(contest); setActiveModal('result');}}>
								{contest.name} {store.appUser.team ? store.teamContest._id == contest._id ? <Icon36Users3Outline width={20} height={20} style={{display: 'inline-block'}}/> : null : null}
							</RichCell>
						)) : 
						<Placeholder
					icon={<Icon24ClockOutline width={70} height={70} />}>
						Нет подведённых результатов
					</Placeholder>
						}
						</List>}
					</Group>
			</Panel>
	</View>
)}));

export default ContestList;
