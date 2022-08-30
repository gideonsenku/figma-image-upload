import UseSingleton from 'use-singleton'

import Loading from './loading.svelte'

const LoadingInstance = UseSingleton(() => {
  const loadingEl = new Loading({
    target: document.body,
    props: { content: '' },
  })

  return {
    show({ title, duration = 0 }) {
      loadingEl.show({
        title,
        duration,
      })
    },
    close() {
      loadingEl.close()
    },
  }
})
export const loading = LoadingInstance()

export default loading
