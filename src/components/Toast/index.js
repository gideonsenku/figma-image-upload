import UseSingleton from 'use-singleton'

import Toast from './toast.svelte'

const ToastInstance = UseSingleton(() => {
  const toastEl = new Toast({
    target: document.body,
    props: { content: '' }
  })

  return ({ title, duration = 1500 }) => {
    toastEl.show({
      title,
      duration
    })
  }
})
export const toast = ToastInstance()

export default Toast
