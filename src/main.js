/* eslint-disable no-undef */
import { UPLOAD_URL_KEY } from './constants/storageKey'
import SettingPanel from './components/Setting/SettingPanel.svelte'

const figmaImageUpload = () => {
  if (
    !/^https:\/\/www\.figma.com/.test(
      window.location.href
    )
  ) return
  const base64BtnWrapper = document.createElement('div')
  const base64Btn = document.createElement('button')
  base64Btn.innerText = '上传OSS'
  base64Btn.addEventListener('click', function () {
    // 缩放比选择器
    const scaleInputs = Array.apply(null, document.querySelectorAll('input[spellcheck="false"][autocomplete="new-password"][class^=raw_components--textInput]'))
    const scales = Array.from(new Set(scaleInputs.map(ele => ele.value)))
    if (scales.length) {
      const {
        selection
      } = figma.currentPage
      if (!selection[0]) {
        alert('请选择要处理的节点')
        return
      }

      Promise.all(scales.map(scale => {
        return selection[0].exportAsync({
          format: 'PNG',
          constraint: getConstraintByScale(scale)
        })
      })).then(u8List => {
        const blob = new Blob([...u8List], {
          type: 'image/png'
        })
        const data = new FormData()
        data.append('file', blob, new Date().getTime() + '.png')
        const url = GM_getValue(UPLOAD_URL_KEY, '')
        if (url) {
          return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              url,
              method: 'POST',
              data,
              onload (xhr) {
                resolve(JSON.parse(xhr.responseText).url)
              }
            })
          })
        } else {
          window.open('https://nocoding.xyz/figma-image-upload/setting.html')
        }
      }).then((url) => {
        copyContent(url)
        figma.notify('图片上传成功，以复制到剪切板')
      })
    }
  })
  base64BtnWrapper.appendChild(base64Btn)

  // 监听export 面板点击监听
  function addExportTabEventListener () {
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
  function addAddBtnEventListener () {
    document.querySelectorAll('span[aria-label^=Add]')[0]?.addEventListener('click', function () {
      setTimeout(() => {
        insertBase64Btn()
      }, 100)
    })
  }

  function insertBase64Btn () {
    const exportBtn = document.querySelectorAll('button[class*=export_panel--exportButton]')[0]
    if (exportBtn) {
      !base64Btn.className && base64Btn.classList.add(...exportBtn.className.split(' '))
      !base64BtnWrapper.className && base64BtnWrapper.classList.add(...exportBtn.parentElement.className.split(' '))
      exportBtn.parentElement.parentElement.insertBefore(base64BtnWrapper, exportBtn.parentElement.nextSibling)
    }
  }

  function copyContent (text) {
    if (typeof navigator.clipboard === 'undefined') {
      const textarea = window.document.querySelector('#copy-area')
      textarea.value = text
      textarea.focus()
      textarea.select()
      const successful = window.document.execCommand('copy')
      if (successful) {
        parent.postMessage({
          pluginMessage: {
            type: 'success'
          }
        }, '*')
      } else {
        parent.postMessage({
          pluginMessage: {
            type: 'fail'
          }
        }, '*')
      }
      return
    }
    navigator.clipboard.writeText(text).then(
      function () {
        parent.postMessage({
          pluginMessage: {
            type: 'success'
          }
        }, '*')
      },
      function (_err) {
        parent.postMessage({
          pluginMessage: {
            type: 'fail'
          }
        }, '*')
      }
    )
  }

  function getConstraintByScale (scale) {
    if (scale === '0.5x') {
      return {
        type: 'SCALE',
        value: 0.5
      }
    } else if (scale === '0.75x') {
      return {
        type: 'SCALE',
        value: 0.75
      }
    } else if (scale === '1x') {
      return {
        type: 'SCALE',
        value: 1
      }
    } else if (scale === '1.5x') {
      return {
        type: 'SCALE',
        value: 1.5
      }
    } else if (scale === '2x') {
      return {
        type: 'SCALE',
        value: 2
      }
    } else if (scale === '3x') {
      return {
        type: 'SCALE',
        value: 3
      }
    } else if (scale === '4x') {
      return {
        type: 'SCALE',
        value: 4
      }
    } else if (scale === '512w') {
      return {
        type: 'WIDTH',
        value: 512
      }
    } else if (scale === '512h') {
      return {
        type: 'HEIGHT',
        value: 512
      }
    }
  }
  addExportTabEventListener()
}

const checkSetting = () => {
  if (
    /^https:\/\/nocoding\.xyz\/figma-image-upload\/setting/.test(
      window.location.href
    )
  ) {
    window.onload = () => {
      const mainEl = document.querySelector('main')

      // eslint-disable-next-line no-new
      new SettingPanel({
        target: mainEl
      })
    }
  }
}

const main = () => {
  checkSetting()
  figmaImageUpload()
}

main()
