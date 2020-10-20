const chavy = init()
const cookieName = '云闪付'
const KEY_signcookie = 'cookie_unipay'

const signinfo = {}
let VAL_signcookie = chavy.getdata(KEY_signcookie)

;(exec = async () => {
  chavy.log(`🔔 ${cookieName} 开始签到`)
  await signdaily()
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function signdaily() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://youhui.95516.com/newsign/api/daily_sign_in`, headers: { token: VAL_signcookie } }
    chavy.post(url, (error, response, data) => {
      try {
        signinfo.signdaily = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `日常签到: 失败`, `${data} == 说明: ${e}`)
        chavy.log(`❌ ${cookieName} signdaily - 日常签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signdaily - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if (signinfo.signdaily) {
    subTitle = `签到: `
	if (!!signinfo.signdaily.signedIn) {
	  if (signinfo.signdaily.signedIn == true) {
	    subTitle += '成功; '
	  } else {
	    subTitle += '失败; '
	  }
	} else {
	  subTitle += '失败; '
	}
  }
  chavy.msg(cookieName, subTitle, detail)
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}