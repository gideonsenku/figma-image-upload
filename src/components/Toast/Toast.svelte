<script>
  let toast
  let visiable = false
  let closeTimer = null
  let content
  export function show({ title, duration = 1500 }) {
    content = title
    if (closeTimer) {
      clearTimeout(closeTimer)
    }
    visiable = true
    closeTimer = setTimeout(() => {
      visiable = false
      closeTimer = null
    }, duration)
  }
</script>

<div class="toast {visiable ? '' : 'toast--hide'}" bind:this={toast}>
  {content}
</div>

<style>
  .toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 12px 24px;
    max-width: 200px;
    color: #eee;
    font-size: 16px;
    z-index: 9999999;
  }
  .toast--hide {
    z-index: -1;
    visibility: hidden;
  }
</style>
