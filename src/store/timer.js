import React from 'react';
import { autorun, action, observable, makeObservable, computed, when } from "mobx";
import { inject, observer } from 'mobx-react'
import dayjs from 'dayjs'

const padding = num => {
    return num >= 10 ? num : `0${num}`
}

class TimerStore{
    constructor(initial){
        const { name } = initial
        makeObservable(this, {
            startTime: observable,
            state: observable,
            value: observable,
            toId: observable,
            
            start: action,
            updateState: action,
            pause: action,
            tick: action,

            display: computed
        })
        this.name = name
    }
    name = ''
    startTime = null
    value = 0
    state = false
    toId = 0
    tick = () => {
        console.log('t')
        if(!this.state) return

        this.value = dayjs().diff(this.startTime, 'second')

        this.toId = setTimeout(() => this.tick(), 1000)
    }
    start = (startTime) => {
        this.updateState(true)
        this.startTime = startTime ?? dayjs()
        this.tick()
    }
    updateState = newState => this.state = newState
    pause = () => {
        this.state == 'pause'
    }
    get display(){
        const minutes = Math.floor(this.value / 60)
        const seconds = this.value % 60
        return `${padding(minutes)}:${padding(seconds)}`
    } 
}

export default TimerStore;

