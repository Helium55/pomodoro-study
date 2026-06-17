<script lang="ts">
  import { onMount } from 'svelte'
  import { bootstrapTheme } from '../themes/bootstrap'
  import Sidebar from '../lib/components/Sidebar.svelte'
  import { goals } from '../lib/stores/goals.svelte'
  import { settings } from '../lib/stores/settings.svelte'
  import { tasks } from '../lib/stores/tasks.svelte'

  let { children } = $props()

  onMount(() => {
    void bootstrapTheme()
    void settings.load()
    void goals.load()
    void tasks.load()
  })
</script>

<div class="app-shell">
  <Sidebar />
  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
  }

  .content {
    min-width: 0;
    flex: 1;
    height: 100vh;
    overflow: auto;
  }

  @media (width <= 760px) {
    .app-shell {
      flex-direction: column;
    }

    .content {
      height: calc(100vh - 107px);
    }
  }
</style>
