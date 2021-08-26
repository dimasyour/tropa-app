import { Snackbar, Avatar } from '@vkontakte/vkui'
import { Icon16Done, Icon16ErrorCircle} from '@vkontakte/icons'

const timeToDate = (date, from = new Date()) => {
	date = new Date(date)
	date.setHours(date.getHours() - 3)
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
	const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
	const day = ['воскресение', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
	return `${d.getDate()} ${months[d.getMonth()]}, ${day[d.getDay()]}`
}

const snackbarOk = text => {
	return (<Snackbar
		onClose={() => setSnackbar(null)}
		before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
		>
			{text}
		</Snackbar>)
}
const snackbarErr = text => {
	return (<Snackbar
		onClose={() => setSnackbar(null)}
		before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16ErrorCircle fill="#fff" width={14} height={14} /></Avatar>}
	  >
		 {text}
	  </Snackbar>)
}

export { timeToDate, timeFormat, declOfNum, getDate, snackbarOk, snackbarErr }