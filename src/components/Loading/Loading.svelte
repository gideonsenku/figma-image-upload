<script>
  let loading
  let visiable = false
  let closeTimer = null
  let content
  export function show({ title, duration = 0 }) {
    content = title
    if (closeTimer) {
      clearTimeout(closeTimer)
    }
    visiable = true
    if (duration != 0) {
      closeTimer = setTimeout(() => {
        visiable = false
        closeTimer = null
      }, duration)
    }
  }

  export function close() {
    if (closeTimer) {
      clearTimeout(closeTimer)
    }
    visiable = false
  }
</script>

{#if visiable}
  <div class="loading-bg" bind:this={loading}>
    <div class="sk-chase">
      <div class="sk-chase-dot" />
      <div class="sk-chase-dot" />
      <div class="sk-chase-dot" />
      <div class="sk-chase-dot" />
      <div class="sk-chase-dot" />
      <div class="sk-chase-dot" />
    </div>
    {#if content}
      <div class="loading-content">
        {content}
      </div>
    {/if}
  </div>
{/if}

<style>
  .loading-bg {
    position: fixed;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.6);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .loading-content {
    font-size: 16px;
    margin-top: 20px;
    color: #fff;
  }
  .sk-chase {
    width: 40px;
    height: 40px;
    animation: sk-chase 2.5s infinite linear both;
  }

  .sk-chase-dot {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    animation: sk-chase-dot 2s infinite ease-in-out both;
  }

  .sk-chase-dot:before {
    content: '';
    display: block;
    width: 25%;
    height: 25%;
    background-color: #fff;
    border-radius: 100%;
    animation: sk-chase-dot-before 2s infinite ease-in-out both;
  }

  .sk-chase-dot:nth-child(1) {
    animation-delay: -1.1s;
  }
  .sk-chase-dot:nth-child(2) {
    animation-delay: -1s;
  }
  .sk-chase-dot:nth-child(3) {
    animation-delay: -0.9s;
  }
  .sk-chase-dot:nth-child(4) {
    animation-delay: -0.8s;
  }
  .sk-chase-dot:nth-child(5) {
    animation-delay: -0.7s;
  }
  .sk-chase-dot:nth-child(6) {
    animation-delay: -0.6s;
  }
  .sk-chase-dot:nth-child(1):before {
    animation-delay: -1.1s;
  }
  .sk-chase-dot:nth-child(2):before {
    animation-delay: -1s;
  }
  .sk-chase-dot:nth-child(3):before {
    animation-delay: -0.9s;
  }
  .sk-chase-dot:nth-child(4):before {
    animation-delay: -0.8s;
  }
  .sk-chase-dot:nth-child(5):before {
    animation-delay: -0.7s;
  }
  .sk-chase-dot:nth-child(6):before {
    animation-delay: -0.6s;
  }

  @keyframes sk-chase {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes sk-chase-dot {
    80%,
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes sk-chase-dot-before {
    50% {
      transform: scale(0.4);
    }
    100%,
    0% {
      transform: scale(1);
    }
  }
</style>
