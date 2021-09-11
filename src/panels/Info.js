import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react'
import bridge from '@vkontakte/vk-bridge'
import {access_token } from '../config'
import { Icon28BookmarkOutline, Icon20GlobeOutline, Icon20ArticleOutline, Icon20HelpOutline, Icon24BroadcastOutline, Icon24MessageOutline, Icon24Cancel } from '@vkontakte/icons'
import { View, Panel, Link, PanelHeader, MiniInfoCell, SimpleCell, Group, Cell, Header, ModalPage, ModalRoot, Title, ModalPageHeader, ANDROID, VKCOM, PanelHeaderButton, usePlatform, Gradient, Avatar } from '@vkontakte/vkui';
import impuls from '../img/impuls.jpg'

const Info = inject('store')(observer(({ id, store }) => {

    const [ activeModal, setActiveModal ] = React.useState(null)
    const platform = usePlatform()
    const [ orgs, setOrgs] = React.useState([])

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
            {orgs.map(org => <SimpleCell description="Вдохновитель" before={<Avatar src={org.photo_200}/>}>{org.first_name} {org.last_name}</SimpleCell>)}
              
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
