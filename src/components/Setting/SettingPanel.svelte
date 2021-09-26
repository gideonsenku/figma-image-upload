<script>
  import { toast } from "../Toast/index";
  import { UPLOAD_URL_KEY } from "../../constants/storageKey";
  let uploadUrl = GM_getValue(UPLOAD_URL_KEY, "");
  function save() {
    try {
      GM_setValue(UPLOAD_URL_KEY, uploadUrl);
      toast({
        title: "保存成功",
      });
    } catch (e) {
      toast({
        title: e.message,
      });
    }
  }
</script>

<div>
  <div>
    <div class="text-blue-800 font-medium mb-3">配置url地址</div>
    <div class="mb-3 pt-0">
      <input
        type="text"
        placeholder="url"
        class="px-3 py-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base border-0 shadow outline-none
      focus:outline-none w-full"
        bind:value={uploadUrl}
      />
    </div>
  </div>
  <button
    class="bg-blue-600 text-white active:bg-blue-600 font-bold uppercase text-base px-8 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
    type="button"
    on:click={save}
  >
    保存
  </button>
</div>

<style>
</style>
