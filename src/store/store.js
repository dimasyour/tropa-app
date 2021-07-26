import { action, configure, observable, makeObservable, computed, when, autorun } from 'mobx'
import { ScreenSpinner } from '@vkontakte/vkui'
import axios from 'axios'
import makeInspectable from 'mobx-devtools-mst';

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

            teamStatus: computed,
            userRole: computed,
            activeContest: computed,
            teamContest: computed,

            setAppUser: action,
            setStatusApp: action,
            goPage: action,
            getAppUser: action,
            togglePopout: action,
            getContestList: action
        })
    }


    activePage = 'hello'
    statusApp = 0
    popout = null
    vk_u = null
    appUser = null
    vk_mates = []
    contestList = []
    
    
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
                uid: this.vk_u.id
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
        : {}
    }
    get userRole(){
        const status = [
            `участник команды ${this.appUser.team?.name}`,
            `капитан команды ${this.appUser.team?.name}`,
            'наблюдатель',
            'организатор',
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
})
autorun(() => {
    console.log('curr team ', mainStore.teamContest)
})

export default makeInspectable(mainStore)