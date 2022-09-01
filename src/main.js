/* eslint-disable no-undef */
import { UPLOAD_URL_KEY } from './constants/storageKey'
import SettingPanel from './components/Setting/SettingPanel.svelte'
import loading from './components/Loading/index'
import { copyContent } from './utils/clipboard'

const figmaImageUpload = () => {
  if (!/^https:\/\/www\.figma.com/.test(window.location.href)) return
  const base64BtnWrapper = document.createElement('div')
  const base64Btn = document.createElement('button')
  base64Btn.innerText = '上传OSS'
  base64Btn.addEventListener('click', exportAndupload)
  base64BtnWrapper.appendChild(base64Btn)

  // 监听export 面板点击监听
  function addExportTabEventListener() {
    const node = document.querySelector('[data-label=export i]')
    if (node) {
      node.addEventListener('click', function () {
        setTimeout(() => {
          insertBase64Btn()
          addAddBtnEventListener()
        }, 100)
      })
    } else {
      setTimeout(() => {
        addExportTabEventListener()
      }, 500)
    }
  }

  // 给+号按钮添加监听
  function addAddBtnEventListener() {
    document
      .querySelectorAll('span[aria-label^=Add]')[0]
      ?.addEventListener('click', function () {
        setTimeout(() => {
          insertBase64Btn()
        }, 100)
      })
  }

  function insertBase64Btn() {
    let exportBtn = null
    const btns = document.querySelectorAll(
      '[class*=export_panel--standalonePanel] button'
    )
    for (let btn of btns) {
      if (btn.querySelector('span')?.innerText === 'Export') {
        exportBtn = btn
      }
    }

    if (exportBtn) {
      !base64Btn.className &&
        base64Btn.classList.add(...exportBtn.className.split(' '))
      !base64BtnWrapper.className &&
        base64BtnWrapper.classList.add(
          ...exportBtn.parentElement.className.split(' ')
        )
      exportBtn.parentElement.parentElement.insertBefore(
        base64BtnWrapper,
        exportBtn.parentElement.nextSibling
      )
    }
  }

  addExportTabEventListener()
}

function getConstraintByScale(scale) {
  if (scale === '0.5x') {
    return {
      type: 'SCALE',
      value: 0.5,
    }
  } else if (scale === '0.75x') {
    return {
      type: 'SCALE',
      value: 0.75,
    }
  } else if (scale === '1x') {
    return {
      type: 'SCALE',
      value: 1,
    }
  } else if (scale === '1.5x') {
    return {
      type: 'SCALE',
      value: 1.5,
    }
  } else if (scale === '2x') {
    return {
      type: 'SCALE',
      value: 2,
    }
  } else if (scale === '3x') {
    return {
      type: 'SCALE',
      value: 3,
    }
  } else if (scale === '4x') {
    return {
      type: 'SCALE',
      value: 4,
    }
  } else if (scale === '512w') {
    return {
      type: 'WIDTH',
      value: 512,
    }
  } else if (scale === '512h') {
    return {
      type: 'HEIGHT',
      value: 512,
    }
  }
}

async function exportAndupload() {
  // 缩放比选择器
  const scaleInputs = Array.apply(
    null,
    document.querySelectorAll(
      'input[spellcheck="false"][autocomplete="new-password"][class^=raw_components--textInput]'
    )
  )
  const scales = Array.from(new Set(scaleInputs.map((ele) => ele.value)))

  if (scales.length) {
    const { selection } = figma.currentPage
    if (!selection[0]) {
      alert('请选择要处理的节点')
      return
    }
    try {
      loading.show({
        title: '图片上传中',
      })
      const scale = scales[0]

      const u8Array = await selection[0].exportAsync({
        format: 'PNG',
        constraint: getConstraintByScale(scale),
      })

      const blob = new Blob([u8Array], {
        type: 'image/png',
      })
      const data = new FormData()
      data.append('file', blob, new Date().getTime() + '.png')
      const uploadUrl = GM_getValue(UPLOAD_URL_KEY, '')
      if (!uploadUrl) {
        window.open('http://blog.sodion.net/figma-image-upload/setting.html')
        return
      }
      const url = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          url: uploadUrl,
          method: 'POST',
          data,
          onload(xhr) {
            if (+xhr.status !== 200) {
              reject(`请求stauts ${xhr.status}`)
              return
            }

            try {
              const url = JSON.parse(xhr.responseText).url
              if (!url) {
                reject('服务端没有返回url')
                return
              }
              resolve(url)
            } catch (e) {
              reject(e)
            }
          },
          onerror(e) {
            reject(e)
          },
        })
      })

      copyContent(url)
      loading.close()
      figma.notify('【图片上传成功】已复制到剪切板')
    } catch (e) {
      console.error(e)
      loading.close()
      figma.notify(
        '【图片上传失败】' + (typeof e === 'string' ? e : JSON.stringify(e))
      )
    }
  }
}

const checkSetting = () => {
  if (
    /^http:\/\/blog\.sodion\.net\/figma-image-upload\/setting/.test(
      window.location.href
    )
  ) {
    window.onload = () => {
      const mainEl = document.querySelector('main')

      // eslint-disable-next-line no-new
      new SettingPanel({
        target: mainEl,
      })
    }
  }
}

const main = () => {
  checkSetting()
  figmaImageUpload()
}

main()
