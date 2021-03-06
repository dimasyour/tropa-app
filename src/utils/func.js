import { Snackbar, Avatar } from '@vkontakte/vkui'
import { Icon16Done, Icon16ErrorCircle} from '@vkontakte/icons'
import ivts from '../img/institutes/1_ivts.png'
import ipu from '../img/institutes/7_ipu.png'
import ipmkn from '../img/institutes/2_ipmkn.png'
import igsn_ipfkst from '../img/institutes/11_igsn-ipfkst.png'
import igds_pti from '../img/institutes/10_igds-pti.png'
import med from '../img/institutes/9_med.png'
import final from '../img/14_final.png'
import gen from '../img/13_generations.png'

const timeToDate = (date, from = new Date()) => {
	date = new Date(date)
	from = new Date(from)
	date.setHours(date.getHours() - 3)
	from.setHours(from.getHours() - 3)
	const left = Math.floor(Math.abs(date - from) / 1000)
	const d = Math.floor(left / 60 / 60 / 24)
	const h = Math.floor(left / 60 / 60)
	const m = Math.floor(left / 60)
	const s = Math.floor(left)
	return s
}
const timeFormat = (format, value) => {
	const d = Math.floor(value / 60 / 60 / 24)
	const h = Math.floor((value - 24 * 60 * 60 * d) / 60 / 60)
	const m = Math.floor((value - 24 * 60 * 60 * d - 60 * 60 * h) / 60)
	const s = Math.floor((value - 24 * 60 * 60 * d - 60 * 60 * h - 60 * m))
	return format.replace('dd', d).replace('hh', h < 10 ? '0' + h : h).replace('mm', m < 10 ? '0' + m : m).replace('ss', s < 10 ? '0' + s : s)
}
const getIcon = institutes => {
	if(institutes.length == 1){
		switch(institutes[0]){
			case 1:
				return ivts
			case 2:
				return ipmkn
			case 9:
				return med
			case 15:
				return gen
			case 16:
				return gen
			case 20:
				return final
		}
	} else if(institutes.length == 2){
		switch(institutes[0]){
			case 7:
				return ipu
			case 3:
				return igds_pti
			case 5:
				return igsn_ipfkst
			
		}
	}
}
function declOfNum(n, text_forms) {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}
const getDate = (date) => {
	const d = new Date(date)
	const months = ["????????????", "??????????????", "??????????", "????????????", "??????", "????????", "????????", "??????????????", "????????????????", "??????????????", "????????????", "??????????????"]
	const day = ['??????????????????????', '??????????????????????', '??????????????', '??????????', '??????????????', '??????????????', '??????????????']
	return `${d.getDate()} ${months[d.getMonth()]}, ${day[d.getDay()]}`
}

const getTime = (time) => {
	const d = new Date(time)
	const months = ["????????????", "??????????????", "??????????", "????????????", "??????", "????????", "????????", "??????????????", "????????????????", "??????????????", "????????????", "??????????????"]
	return `${d.getDate()} ${months[d.getMonth()]} ?? ${d.getHours()}:${d.getMinutes()}`
}

const snackbarOk = (text, setter) => {
	return setter(<Snackbar
		onClose={() => setter(null)}
		before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
		>
			{text}
		</Snackbar>)
}
const snackbarErr = (text, setter) => {
	return setter(<Snackbar
		onClose={() => setter(null)}
		before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
	  >
		 {text}
	  </Snackbar>)
}

export { timeToDate, timeFormat, declOfNum, getDate, snackbarOk, snackbarErr, getTime, getIcon }