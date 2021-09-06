import { action, configure, observable, makeObservable, computed, when, autorun } from 'mobx'
import { ScreenSpinner, Snackbar, Avatar } from '@vkontakte/vkui'
import { Icon16Done, Icon16ErrorCircle } from '@vkontakte/icons';
import axios from 'axios'
import makeInspectable from 'mobx-devtools-mst';
import io from 'socket.io-client'
import bridge from '@vkontakte/vk-bridge'
import { serverURL, access_token } from '../config'
import { timeToDate } from '../utils/func';
import Status from '../panels/Status';

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
            socketStatus: observable,
            currentTask: observable,
            cycle: observable,
            orgTeams: observable,

            teamStatus: computed,
            userRole: computed,
            activeContest: computed,
            teamContest: computed,
            secToTeamContest: computed,
            hashNextPoint: computed,

            setAppUser: action,
            setOrgTeams: action,
            setStatusApp: action,
            goPage: action,
            getAppUser: action,
            togglePopout: action,
            getContestList: action,
            createConnection: action,
            setSocketStatus: action,
            setCurrentTask: action
        })
    }


    activePage = 'hello'
    statusApp = 0
    popout = null
    vk_u = null
    appUser = null
    vk_mates = []
    contestList = []
    socketStatus = null
    currentTask = null
    cycle = null
    orgTeams = []
    
    
    socket = null
    createConnection = () => {
        this.socket = io("https://leton.cc/", {
            reconnectionDelayMax: 10000,
            query: {
                "team": this.appUser.team._id, 
                "point": this.appUser.team.stage, 
                "role": this.appUser.role
            }
        });
        this.socket.on('connect', (data) => {
            console.log('соединил')
              this.setSocketStatus(<Status mode='success'>На связи</Status>)
		})

		this.socket.on('disconnect', (reason) =>{
            this.setSocketStatus(<Status mode='danger'>Потеря соединения</Status>)
			const reason_codes = [
				{code: 'io server disconnect', reason: 'Отключён сервером'},
				{code: 'io client disconnect', reason: 'Отключён клиентом'},
				{code: 'ping timeout', reason: 'Сервер не ответил'},
				{code: 'transport close', reason: 'Вы потеряли сеть либо изменили тип сети'},
				{code: 'transport error', reason: 'Сервер не отвечает. Сообщите организаторам'},
			]
              this.setSocketStatus(<Status mode='warning'>Переподключаемся</Status>)
            setTimeout(() => { 
                this.socket.connect()
            }, 3000)
		})
        this.socket.on('org:update_team', (data) => {
            this.setOrgTeams(data.teams)
		})
        this.socket.on('team:update_team', data => {
            this.getAppUser()
        })
        this.socket.on('connect_error', () => {
            this.setSocketStatus(<Status mode='danger'>Ошибка подключения</Status>)
            setTimeout(() => { 
                this.socket.connect()
            }, 1000)
        })

        this.socket.on('init task', data => this.setCurrentTask(data.point))
    }
    
    updateTeammates = () => {
        this?.appUser?.team ? 
		bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "params": {"user_ids": this.appUser.team.mates.map(mate => mate.uid).filter(mate => mate.uid != this.vk_u.id).join(','), "v":"5.131", "access_token": access_token, "fields": "photo_200"}}).then(data => {
            this.vk_mates = data.response
		}) : []
    }

    getCycle = () => {
        axios.get(serverURL + 'points').then(data => {
            this.cycle = data.data.points
        })
    }
    setCurrentTask = task => this.currentTask = task
    setSocketStatus = status => this.socketStatus = status
    setAppUser = user => this.appUser = user
    setStatusApp = value => this.statusApp = value
    setOrgTeams = teams => this.orgTeams = teams
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
                vkUser: this.vk_u.first_name + ' ' + this.vk_u.last_name,
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
    get hashNextPoint(){
        return this.appUser?.point?.next?.task.qrHash ?? 'kjdhsl;'
    }
    get teamContest(){
        const user = this.appUser
        if(user.team && this.contestList){
            let a = this.contestList.filter(contest => contest.institute.includes(user.team.institute)).pop() 
            // a.instStr = a.institute.join().replace(',','')
            return a
        } else {
            return { e: 'empty'}
        }
    }
    get secToTeamContest(){
        return this.teamContest?.date ? timeToDate(this.teamContest.date) : null
    }
    get userRole(){
        const status = [
            `${this.store?.vk_u.sex == 1 ? 'участница' : 'участник'} команды "${this.appUser.team?.name}"`,
            `капитан команды "${this.appUser.team?.name}"`,
            'наблюдатель',
            this.appUser.point?.title ? `организатор точки "${this.appUser.point?.title}"` : 'организатор, точка не назначена',
            'модератор',
            'администратор'
        ]
        return status[this.appUser.role]
    }
    get teamStatus(){
        const status = [
            'отклонена',
            'отложена',
            'на рассмотрении',
            'подтверждена',
            '',
            'дисквалифицированы'
        ]
        return status[this.appUser.team.status]
    }

}

const mainStore = new MainStore()

autorun(() => {
    mainStore.updateTeammates()
    if(((mainStore.appUser.team.stage != 21 && mainStore.activeContest?.institute.includes(mainStore.appUser.team.institute)) || mainStore.appUser.role > 2) && !mainStore.socket){
        mainStore.createConnection()
    }
})
export default makeInspectable(mainStore)