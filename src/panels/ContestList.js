import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import { getDate, getIcon } from '../utils/func'
import { Icon36Users3Outline, Icon28CalendarOutline, Icon24ClockOutline, Icon16ChevronOutline, Icon24Cancel } from '@vkontakte/icons';

import Labirint from '../icons/Labirint'
import Gold from '../icons/Gold'
import Silver from '../icons/Silver'
import Bronze from '../icons/Bronze'


import { View, Panel, Avatar, PanelHeader, PanelHeaderButton, ModalPageHeader, RichCell, List, Tabs, TabsItem, Group, Div, Placeholder, ModalRoot, ModalPage, usePlatform, VKCOM, ANDROID, IOS } from '@vkontakte/vkui';
const ContestList = inject('store')(observer(({ id, store }) => {
	const platform = usePlatform()
	const [ activeTab, setActiveTab ] = React.useState('future')
	const [ activeDetTab, setActiveDetTab ] = React.useState('first')
	const [ activeModal, setActiveModal ] = React.useState(null)
	const [ selectedContest, setSelectedContest ] = React.useState({})

	const lastContest = store.contestList.filter(contest => contest.status == 2)
	const futureContest = store.contestList.filter(contest => contest.status == 0)

	const institute = ['', 'ИВТС', 'ИПМКН', 'ИГДИС', 'ИЕН', 'ИПФКСиТ', 'ПТИ', 'ИПУ', 'ИГСН', 'МИ']
	
	const modalRoot = (<ModalRoot activeModal={activeModal}>
		<ModalPage id='result' 
		settlingHeight={100}
		onClose={() => { setActiveModal(null); setActiveDetTab('first')}}
        settlingHeight={100}
        header={<ModalPageHeader
        
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={() => { setActiveModal(null); setActiveDetTab('first')}}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			{selectedContest?.name}
		  </ModalPageHeader>} >
			  {selectedContest.results ?
			 	selectedContest.results.length > 3 ? 
				 <>
				 <Tabs>
						<TabsItem
					 		onClick={setActiveDetTab.bind(this, 'first')}
							selected={activeDetTab == 'first'}
					 	>{institute[selectedContest.results[0].institute]}</TabsItem>
						 <TabsItem
					 		onClick={setActiveDetTab.bind(this, institute[selectedContest.results[5].institute])}
							selected={activeDetTab == institute[selectedContest.results[5].institute]}
					 	>{institute[selectedContest.results[5].institute]}</TabsItem>
				 </Tabs>
				 {activeDetTab == 'first' && <List style={{paddingBottom: 32}}>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						 <Gold/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FEEA97', fontSize: 24, borderRadius: 20, color: 'black'}}>Победители забега</div>
						 <div style={{padding: '5px 20px',  fontSize: 20}}>«{selectedContest.results[0].name.trim()}»</div>
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Silver/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#E3E3E3', fontSize: 20, borderRadius: 20, color: 'black'}}>2-ое место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[1].name.trim()}»</div>
						 
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Bronze/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FFB973', fontSize: 20, borderRadius: 20, color: 'black'}}>3-е место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[2].name.trim()}»</div>
						 
				 </div>
			   </List> }
			   {activeDetTab != 'first' && <List style={{paddingBottom: 32}}>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						 <Gold/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FEEA97', fontSize: 24, borderRadius: 20, color: 'black'}}>Победители забега</div>
						 <div style={{padding: '5px 20px',  fontSize: 20}}>«{selectedContest.results[3].name.trim()}»</div>
						
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Silver/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#E3E3E3', fontSize: 20, borderRadius: 20, color: 'black'}}>2-ое место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[4].name.trim()}»</div>
						
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Bronze/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FFB973', fontSize: 20, borderRadius: 20, color: 'black'}}>3-е место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[5].name.trim()}»</div>
				 </div>
			   </List> }
				 </>
				 :
				 <List style={{paddingBottom: 32}}>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						 <Gold/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FEEA97', fontSize: 24, borderRadius: 20, color: 'black'}}>Победители забега</div>
						 <div style={{padding: '5px 20px',  fontSize: 20}}>«{selectedContest.results[0].name.trim()}»</div>
						
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Silver/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#E3E3E3', fontSize: 20, borderRadius: 20, color: 'black'}}>2-ое место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[1].name.trim()}»</div>
				 </div>
				 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
						 <Bronze/>
						 <div style={{padding: '5px 20px', fontWeight: 'bold', backgroundColor: '#FFB973', fontSize: 20, borderRadius: 20, color: 'black'}}>3-е место</div>
						 <div style={{padding: '5px 20px',  fontSize: 18}}>«{selectedContest.results[2].name.trim()}»</div>
				 </div>
			   </List> 
			  :
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
							before={<Avatar src={getIcon(contest.role)} mode="app"/>}
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
							before={<Avatar src={getIcon(contest.role)} mode="app"/>}
							caption={getDate(contest.date)}
							after={contest.results.length ? <Icon16ChevronOutline width={24} height={24}/> : 'подведение итогов'}
							onClick={ contest.results.length ? () => { setSelectedContest(contest); setActiveModal('result');} : null}>
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
