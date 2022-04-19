<template>
  <div id="root">
    <b-container>
      <Auth :is-signed-in="isSignedIn" />
      <h1>
        AI Generated Collective NFT Collection
        <br />
        <br />
        <span v-if="isTotalExceed">🎉🎉 Collection Completed 🎉🎉</span>
        <span v-else>{{ currentSupply }} / {{ totalSupply }}</span>
      </h1>
      <ImageGenerator :isSignedIn="isSignedIn" :isTotalExceed="isTotalExceed" />
      <Tokens />
    </b-container>
  </div>
</template>

<script>
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import Vue from "vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

import "./global.css";
import getConfig from "./config";
import ImageGenerator from "./components/ImageGenerator.vue";
import Auth from "./components/Auth.vue";
import Tokens from "./components/Tokens.vue";
const nearConfig = getConfig(process.env.NODE_ENV || "development");
console.log(
  `networkId:${nearConfig.networkId} CONTRACT_NAME:${nearConfig.contractName}`
);
window.networkId = nearConfig.networkId;

export default {
  name: "App",
  data() {
    return { totalSupply: 0, currentSupply: 0, isTotalExceed: false };
  },
  async created() {
    document.title = "ai-generated-nft";
    this.totalSupply = await window.contract.nft_total_supply();
    this.currentSupply = await window.contract.nft_current_supply();
    this.isTotalExceed = window.collection_completed =
      this.currentSupply >= this.totalSupply;
  },
  computed: {
    isSignedIn() {
      return window.walletConnection.isSignedIn();
    },
  },
  components: {
    ImageGenerator,
    Auth,
    Tokens,
  },
};
</script>
