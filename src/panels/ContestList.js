import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import { getDate } from '../utils/func'
import { Icon36Users3Outline, Icon28CalendarOutline, Icon24ClockOutline, Icon16ChevronOutline, Icon24Cancel } from '@vkontakte/icons';

import Labirint from '../icons/Labirint'
import { ReactComponent as Gold } from '../icons/gold.svg'
import { ReactComponent as Silver } from '../icons/silver.svg'
import { ReactComponent as Bronze } from '../icons/bronze.svg'

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
					<div style={{ display: 'flex'}}>
						<Gold style={{height: 120, flex: '2'}}/>
						<div style={{flex: 8}}>
							<div style={{margin: '10px 0', padding: '10px', background: '#FEEA97', fontWeight: 800, color: 'black', borderTopLeftRadius: '6px'}}>Победители забега</div>
							<div style={{fontWeight: 800, fontSize: 40}}>{selectedContest.results[0]?.name}</div>
						</div>
					</div>
					<div style={{ display: 'flex'}}>
						<Silver style={{height: 120, flex: '2'}}/>
						<div style={{flex: 8}}>
							<div style={{margin: '10px 0', padding: '10px', background: '#E3E3E3', fontWeight: 800, color: 'black', borderTopLeftRadius: '6px'}}>2-ое место</div>
							<div style={{fontWeight: 800, fontSize: 40}}>{selectedContest.results[1]?.name}</div>				
						</div>
					</div>
					<div style={{ display: 'flex'}}>
						<Bronze style={{height: 120, flex: '2'}}/>
						<div style={{flex: 8}}>
							<div style={{margin: '10px 0', padding: '10px', background: '#FFB973', fontWeight: 800, borderTopLeftRadius: '6px'}}>3-ое место</div>
							<div style={{fontWeight: 800, fontSize: 40}}>{selectedContest.results[2]?.name}</div>
						</div>
					</div>
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
