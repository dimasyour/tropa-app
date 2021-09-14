import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import bridge from '@vkontakte/vk-bridge'
import {access_token } from '../config'
import { Icon28BookmarkOutline, Icon20GlobeOutline, Icon20ArticleOutline, Icon20HelpOutline, Icon24BroadcastOutline, Icon24MessageOutline, Icon24Cancel } from '@vkontakte/icons'
import { View, Panel, Link, PanelHeader, MiniInfoCell, SimpleCell, Group, Cell, Header, ModalPage, ModalRoot, Title, ModalPageHeader, ANDROID, VKCOM, PanelHeaderButton, usePlatform, Gradient, Avatar, Text, Tabs, TabsItem, Div } from '@vkontakte/vkui';
import impuls from '../img/impuls.jpg'

const Info = inject('store')(observer(({ id, store }) => {

    const [ activeModal, setActiveModal ] = React.useState(null)
    const platform = usePlatform()
    const [ orgs, setOrgs] = React.useState([])
    const [activeTab, setActiveTab] = React.useState('rules')

    React.useEffect(() => {
        bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": "183607486,156100855,188766453,173928496,440208132,503012833", "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(d => {
          setOrgs(d.response)
          console.log(d)
      })
    },[])

    const modalRoot = <ModalRoot activeModal={activeModal}>
        <ModalPage
		id="rules"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Правила
		  </ModalPageHeader>} >
      <div style={{padding: '0 10px'}}>
					<Text weight="bold">Дорогие первокурсники! Чтобы ваша «Тропа» прошла без проблем и оставила только хорошие воспоминания, соблюдайте эти несложные правила:</Text>
					<br/>
					<Text weight="bold">1. Не выбегайте на проезжую часть. Вся игра проходит на территории студенческого городка, а именно в квадрате, окруженном улицами – проспектом Ленина, ул. Агеева, ул. Фридриха Энгельса, ул. Мира.</Text>

					<Text weight="semibold">В противном случае вы автоматически выбываете из игры и получаете дисциплинарное взыскание по решению Университета.</Text>
					<br/>
					<Text weight="bold">2. Не ругайтесь матом и не употребляйте в своей речи нецензурные выражения.</Text>
					<br/>
					<Text weight="bold">3. Во время игры строго запрещено распивать спиртные напитки.</Text>
					<br/>
					<Text weight="bold">4. Не курите во время игры. Под запретом также находятся кальяны, система IQOS и вейпы.</Text>
					<br/><br/>
					<Text weight="bold">В случае любых проблем вы можете нажать на иконку огонька в приложении или позвонить главному организатору Анастасии Артемовой. Ее номер вы найдете на бейджах организаторов или на выданной вам карте.</Text>
        		</div>
		  
			
		</ModalPage>
        <ModalPage
		id="orgs"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Организаторы
		  </ModalPageHeader>} >
          <Gradient style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 32,
          }}>
            <Avatar size={96} src={impuls}/>
            <Title style={{marginBottom: 8, marginTop: 20}} level="2"
                   weight="medium">Студенческий журнал "Импульс"</Title>
            </Gradient>
            <MiniInfoCell
                before={<Icon20ArticleOutline />}
                textWrap="full"
                textLevel="primary"
                >
          «Импульс» — это журнал Профсоюзной организации студентов и аспирантов ТулГУ. Наша миссия заключается в том, чтобы каждый студент, каждый сотрудник Тульского опорного знал обо всем, что происходит в стенах вуза из первых уст.

С нами ты будешь на одной волне. Мы расскажем тебе:
— о самых актуальных новостях ТулГУ;
— о грандиозных мероприятиях, проводимых нашим вузом;
— о самых талантливых студентах и заслуженных преподавателях;

Оставайся с нами и будь в курсе!
            </MiniInfoCell>
            <MiniInfoCell
            before={<Icon20GlobeOutline />}
          >
            <Link href="https://vk.com/impuls_71">vk.com/impuls_71</Link>
          </MiniInfoCell>
          <Group header={<Header mode="secondary">Главные организаторы</Header>}>
            {orgs.map(org => <SimpleCell before={<Avatar src={org.photo_200}/>}>{org.first_name} {org.last_name}</SimpleCell>)}
              
          </Group>
		</ModalPage>
        <ModalPage
		id="support"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Поддержка
		  </ModalPageHeader>} >
		  <MiniInfoCell
            before={<Icon20ArticleOutline />}
            textWrap="short"
          >
            Если у вас возникли трудности, вы можете обратиться к этим организаторам. Просто нажмите на их имена.
          </MiniInfoCell>
          {orgs.map(org => <Link href={`https://vk.com/id${org.id}`}><SimpleCell before={<Avatar src={org.photo_200}/>}>{org.first_name} {org.last_name}</SimpleCell></Link>)}
		</ModalPage>
        <ModalPage
		id="forOrgs"
		settlingHeight={100}
		onClose={setActiveModal.bind(this, null)}
		header={<ModalPageHeader
			left={(
				<Fragment>
				  {(platform === ANDROID || platform === VKCOM) && <PanelHeaderButton onClick={setActiveModal.bind(this, null)}><Icon24Cancel /></PanelHeaderButton>}
				</Fragment>
			  )}
		  >
			Памятка
		  </ModalPageHeader>} >
		  <Tabs>
        <TabsItem
        onClick={setActiveTab.bind(this, 'rules')}
        selected={activeTab === 'rules'}
        >
          Правила
        </TabsItem>
        <TabsItem
        onClick={setActiveTab.bind(this, 'app')}
        selected={activeTab === 'app'}
        >
          Приложение
        </TabsItem>
        <TabsItem
        onClick={setActiveTab.bind(this, 'alg')}
        selected={activeTab === 'alg'}
        >
          Алгоритм
        </TabsItem>
        
      </Tabs>
			{activeTab === 'rules' &&<div style={{padding: '0 10px'}}>
					<Text weight="bold">Уважаемые организаторы! Убедительная просьба соблюдать некоторые правила на «Тропе первака»:</Text>
					<br/>
					<Text weight="bold">- ставьте точку в строго обусловленном месте, отмеченном на карте;</Text>
          <br/>
					<Text weight="bold">- находитесь на точке в бейджике и брендированных ветровках. Если вам нужно отойти, оставляйте мерч и бейджи на точке;</Text>
					<br/>
					<Text weight="bold">- вас на точке двое, не покидайте свою точку одновременно. Если по какой-то причине обоим организаторам надо покинуть точку, нажмите на огонек и дождитесь прихода странствующего организатора;</Text>
					<br/>
					<Text weight="bold">- когда на точку приходит команда, вы встречаете её в масках. Соблюдайте социальную дистанцию с первокурсниками, передавайте предметы только в перчатках;</Text>
					<br/>
					<Text weight="bold">- если что-то случилось на точке, сразу нажимайте на огонек или звоните главному организатору Артемовой Анастасии, её номер указан на вашем бейдже.</Text>
						</div>}
        {activeTab === 'app' && <div style={{padding: '0 10px'}}>
					<Text weight="bold">Вся информация о вашей точке расположена на главной странице. Вы видите список команд, участвующих в этом забеге. Как только команда отсканирует QR-код на вашу точку, вы увидите это в приложении.</Text>
					</div>}
        {activeTab === 'alg' && <div style={{padding: '0 10px'}}>
					<Text weight="bold">Порядок действий, когда команда пришла к вам на точку:
</Text>
					<br/>
					<Text weight="bold">- засечь время прихода;</Text>
          <br/>
					<Text weight="bold">- поздороваться, спросить название команды и девиз;</Text>
					<br/>
					<Text weight="bold">- зачитать историческую справку (информация, справка);</Text>
					<br/>
					<Text weight="bold">- объяснить правила конкурса (информация, задание), раздать материалы, если они нужны;</Text>
					<br/>
					<Text weight="bold">- внимательно следить за прохождением конкурса. Постараться избежать ЧП (если оно все-таки произошло, сразу звонить главному организатору);</Text>
          <Text weight="bold">- не забывайте следить за временем. На прохождение каждой точки отводится РОВНО 7 минут. Не нужно ни больше, ни меньше. Если вы провели конкурс, а время ещё осталось, заходите в раздел информация, занималки и поиграйте с первокурсниками;</Text>
          <Text weight="bold">- когда истекло 7 минут, нажмите на стрелочку напротив команды, которая сейчас на вашей точке и покажите капитану высветившийся QR-код;</Text>
          <Text weight="bold">- когда команда убежала, нажмите на галочку в разделе с QR-кодом, чтобы открыть страницу выставления оценок. Выставляя оценки, обязательно посоветуйтесь со своим коллегой на точке и хорошо подумайте. Оценивайте не только прохождение конкурса, но и сплоченность и дружность команды. Если были какие-то проблемы на точке с командой или наоборот они были очень хорошими – оставь свой комментарий, выставляя оценку, чтобы мы узнали.</Text>
						</div>}
		</ModalPage>
    </ModalRoot>
	
	return (
        <View id="info" activePanel="info" modal={modalRoot}>
            <Panel id={id}>
                <PanelHeader separator={false}>
                    Информация
                </PanelHeader>
                <Group header={<Header mode="secondary">Забег</Header>}>
                    <Cell before={<Icon24BroadcastOutline width={28} height={28}/>} after={store.socketStatus}>
                                Статус сервера
                    </Cell>
                    <Cell before={<Icon20HelpOutline width={28} height={28}/>} onClick={setActiveModal.bind(this, 'rules')}>
                        Правила
                    </Cell>
                    {store.appUser.role > 2 && <Cell before={<Icon20HelpOutline width={28} height={28}/>} onClick={setActiveModal.bind(this, 'forOrgs')}>
                        Памятка организатора
                    </Cell>}
                </Group>
                <Group header={<Header mode="secondary">Поддержка</Header>}>
                    <Cell before={<Icon24MessageOutline width={28} height={28}/>} onClick={setActiveModal.bind(this, 'support')}>
                        Связь с организаторами
                    </Cell>
                    <Cell before={<Icon28BookmarkOutline/>} onClick={setActiveModal.bind(this, 'orgs')}>
                        Об организаторах
                    </Cell>
                </Group>
            </Panel>
        </View>
)}));

export default Info;
