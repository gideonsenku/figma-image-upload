export function copyContent(text) {
  if (typeof navigator.clipboard === 'undefined') {
    const textarea = window.document.querySelector('#copy-area')
    textarea.value = text
    textarea.focus()
    textarea.select()
    const successful = window.document.execCommand('copy')
    if (successful) {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'success',
          },
        },
        '*'
      )
    } else {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'fail',
          },
        },
        '*'
      )
    }
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'success',
          },
        },
        '*'
      )
    },
    function (_err) {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'fail',
          },
        },
        '*'
      )
    }
  )
}
