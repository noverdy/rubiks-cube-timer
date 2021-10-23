var stop = true
var stopwatch = null
var time_passed = 0
var history_open = false


const $ = (id) => {
    return document.getElementById(id)
}


const generate = () => {
    scr = ''
    for(c=b=j=25,r=Math.random;j;c+b-5|c-m&&b-m?scr+=("URFBLD"[j--,c=b,b=m]+" 2'"[0|r()*3]+" "):0)m=0|r()*6
    return scr
}


const save_data = (date, time, scramble) => {
    let data = JSON.stringify([date, time, scramble])
    let local = get_history()
    local.push(data)
    set_history(local)
}


const load_data = () => {
    let data = get_history().reverse()
    for (let i = 0; i < data.length; i++) {
        data[i] = JSON.parse(data[i])
    }
    return data
}


const get_history = () => {
    return JSON.parse(localStorage.getItem('history'))
}


const set_history = (data) => {
    localStorage.setItem('history', JSON.stringify(data))
}


const download = (filename, text) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}


const format_time = (time, fixed=true) => {
    let m = Math.floor(time/6000)
    let s = Math.floor(time%6000 / 100)
    let ms = time % 100
    let time_formatted
    if (fixed === false && m === 0) {
        time_formatted = String(s).padStart(2, 0) + '.' + String(ms).padStart(2, 0)
    }
    else {
        time_formatted = String(m).padStart(2, 0) + ':' + String(s).padStart(2, 0) + '.' + String(ms).padStart(2, 0)
    }
    return time_formatted
}


const update_record = () => {
    let history = load_data()
    let record = ''
    if (history.length === 0) {
        record = 'PB: - | Ao5: -'
    }
    else {
        let pb = Infinity
        history.forEach(val => {
            if (val[1] < pb) pb = val[1]
        })
        let ao5 = '-'
        if (history.length >= 5) {
            ao5 = 0
            for (let i = 0; i < 5; i++) {
                ao5 += history[i][1]
            }
            ao5 = format_time(Math.floor(ao5/5), false)
        }
        record = `PB: ${format_time(pb, false)} | Ao5: ${ao5}`
    }
    $('record').innerHTML = record
}


const update_history = () => {
    let template = '<div class="row"><div class="date">DATE</div><div class="time">TIME</div><div class="move">MOVE</div></div>'
    let html = ''
    load_data().forEach((val, key, arr) => {
        let data = template.replace('DATE', val[0]).replace('TIME', format_time(val[1], false)).replace('MOVE', val[2])
        if (key === arr.length - 1) {
            data = data.replace('row', 'row-end')
        }
        html += data
    })
    $('history-data').innerHTML = html
}


var space_down = false
var r_down = false
document.addEventListener('keyup', e => {
    if (e.code == 'Space') {
        if (r_down && !space_down) return
        space_down = false

        if (stop) {
            $('hint').innerHTML = 'Press Space to stop | Press R to cancel'
            $('stopwatch').classList.remove('stopwatch-hold')
            document.body.classList.remove('hold-bg')
            document.body.classList.add('run-bg')
            stop = false

            stopwatch = setInterval(() => {
                time_passed++
                let time_formatted = format_time(time_passed)
                $('stopwatch').innerHTML = time_formatted
            }, 10)
        }
        else {
            stop = true
        }
    }
    if (e.code === 'KeyR') {
        if (space_down) return
        r_down = false
        stop = true
    }
})


document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        if (r_down || space_down) return
        space_down = true
        if (stop) {
            $('hint').innerHTML = 'Release Space to start'
            $('stopwatch').classList.add('stopwatch-hold')
            $('history-btn').style.display = 'none'
            $('stopwatch').innerHTML = '00:00.00'
            $('stopwatch').classList.remove('warning')
            $('scramble-wrapper').style.opacity = 0
            $('record').style.opacity = 0
            document.body.classList.add('hold-bg')

            if (history_open) $('history-btn').click()
        }
        else {
            clearInterval(stopwatch)
            save_data(new Date().toLocaleString(), time_passed, $('scramble').innerHTML)
            update_record()

            $('hint').innerHTML = 'Hold Space to get ready'
            $('history-btn').style.display = ''
            $('scramble').innerHTML = generate()
            $('scramble-wrapper').style.opacity = 100
            $('record').style.opacity = 100
            document.body.classList.remove('run-bg')
            time_passed = 0
        }
    }

    if (e.code === 'KeyR') {
        if (r_down || space_down) return
        r_down = true
        if (!stop) {
            clearInterval(stopwatch)

            $('hint').innerHTML = 'Hold Space to get ready'
            $('history-btn').style.display = ''
            $('scramble').innerHTML = generate()
            $('scramble-wrapper').style.opacity = 100
            $('record').style.opacity = 100
            $('stopwatch').classList.add('warning')
            document.body.classList.remove('run-bg')
            time_passed = 0
        }
    }
})


$('history-btn').onclick = () => {
    $('history-sidebar').classList.toggle('history-open')
    $('history-btn').classList.toggle('history-btn-open')
    history_open = !history_open
    update_history()
}


$('export').onclick = () => {
    let csv = 'No,Date,Time,Scramble\n'
    load_data().forEach((val, key, arr) => {
        let row = (key + 1) + ','
        val.forEach(s => {
            if (!isNaN(s)) s = format_time(s)
            row += '"' + s + '",'
        })
        csv += row.substring(0, row.length - 1) + '\n'
    })
    download('3x3 Time ' + new Date().toLocaleString() + '.csv', csv)
}


$('shuffle').onclick = () => {
    $('scramble').innerHTML = generate()
}

$('shuffle').click()
if (get_history() === null) set_history([])

update_record()