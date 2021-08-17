import { action, configure, observable, makeObservable, computed, when, autorun } from 'mobx'
import { ScreenSpinner, Snackbar, Avatar } from '@vkontakte/vkui'
import { Icon16Done, Icon16ErrorCircle } from '@vkontakte/icons';
import axios from 'axios'
import makeInspectable from 'mobx-devtools-mst';
import io from 'socket.io-client'
import bridge from '@vkontakte/vk-bridge'
import { serverURL, access_token } from '../config'

configure({ enforceActions: "always"})

class MainStore{
    constructor(){
        makeObservable(this, {
            activePage: observable,
            popout: observable,
            vk_u: observable,
            appUser: observable,
            statusApp: observable,
            vk_mates: observable,
            contestList: observable,
            socket: observable,
            // homeSnackbar: observable,

            teamStatus: computed,
            userRole: computed,
            activeContest: computed,
            teamContest: computed,

            setAppUser: action,
            setStatusApp: action,
            goPage: action,
            getAppUser: action,
            togglePopout: action,
            getContestList: action,
            createConnection: action,
            // setHomeSnackbar: action,
        })
    }


    activePage = 'hello'
    statusApp = 0
    popout = null
    vk_u = null
    appUser = null
    vk_mates = []
    contestList = []
    homeSnackbar = null
    
    
    socket = null
    setHomeSnackbar = snackbar => this.homeSnackbar = snackbar
    createConnection = () => {
        this.socket = io("https://leton.cc/", {
            reconnectionDelayMax: 10000,
            query: {
                "team": this.appUser.team._id
            }
        });
        this.socket.on('connect', (data) => {
			this.setHomeSnackbar(<Snackbar
                onClose={() => this.setHomeSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
              >
             	Соединение с Тропой установлено
              </Snackbar>)
		})

		this.socket.on('disconnect', (reason) =>{
			const reason_codes = [
				{code: 'io server disconnect', reason: 'Отключён сервером'},
				{code: 'io client disconnect', reason: 'Отключён клиентом'},
				{code: 'ping timeout', reason: 'Сервер не ответил'},
				{code: 'transport close', reason: 'Вы потеряли сеть либо изменили тип сети'},
				{code: 'transport error', reason: 'Сервер не отвечает. Сообщите организаторам'},
			]
			this.setHomeSnackbar(<Snackbar
                onClose={() => this.setHomeSnackbar(null)}
                before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
              >
             	{reason_codes.filter(code => code.code == reason).pop().reason}. Переподключаемся...
              </Snackbar>)
            setTimeout(() => { 
                this.socket.connect()
            }, 3000)
		})
        this.socket.on('connect_error', () => {
            setTimeout(() => { 
                this.socket.connect()
            }, 1000)
        })
    }
    


    updateTeammates = () => {
        this.appUser.team ? 
		bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": this.appUser.team.mates.map(mate => mate.uid).filter(mate => mate.uid != this.vk_u.id).join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(data => {
            this.vk_mates = data.response
		}) : []
    }

    

    setAppUser = user => this.appUser = user
    setStatusApp = value => this.statusApp = value
    goPage = page => {
        this.activePage = page
        window.history.pushState({panel: page}, `${page}`)
    }
    togglePopout = () => this.popout = this.popout ? null : <ScreenSpinner size='large' />
    setVkU = u => this.vk_u = u
    getAppUser = function(){
        return axios.get(serverURL + 'users/create', {
            params:{
                uid: this.vk_u.id,
                vkUser: this.vk_u
            }
        }).then(res => {
            this.appUser = res.data.user
            return res
        })
    }
    getContestList = () => {
        return axios.get(serverURL + 'contest').then((data) => {
            this.contestList = data.data.contests
        })
    }
    updateAppUser = user => this.appUser = user


    get activeContest(){
        return this.appUser ? this.contestList.filter(contest => contest.status == 1).pop() 
        : {}
    }
    get teamContest(){
        const user = this.appUser
        return user.team ? this.contestList.filter(contest => contest.institute == user.team.institute).pop() 
        : { e: 'empty'}
    }
    get userRole(){
        const status = [
            `${this.store?.vk_u.sex == 1 ? 'участница' : 'участник'} команды "${this.appUser.team?.name}"`,
            `капитан команды "${this.appUser.team?.name}"`,
            'наблюдатель',
            `организатор точки "${this.appUser.point?.title}"`,
            'модератор',
            'администратор'
        ]
        return status[this.appUser.role]
    }
    get teamStatus(){
        const status = [
            'отложена',
            'на рассмотрении',
            'подтверждена',
            'отклонена'
        ]
        return status[this.appUser.team.status]
    }

}
const mainStore = new MainStore()

autorun(() => {
    mainStore.updateTeammates()
    // mainStore.createConnection()
})

export default makeInspectable(mainStore)