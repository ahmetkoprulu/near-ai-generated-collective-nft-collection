<template>
  <div class="d-flex justify-content-end">
    <div v-if="!IsSignedIn">
      <b-button variant="default" @click="login">
        <b-icon icon="wallet2"></b-icon>
        Connect Wallet
      </b-button>
    </div>
    <div cols="2" v-else>
      <a class="link" style="style: none; float: right" @click="logout">
        {{ accountId }}
      </a>
      <div>{{ balance }} NEAR</div>
    </div>
  </div>
</template>
<script>
import { logout, login } from "../utils";
import { utils } from "near-api-js";

export default {
  computed: {
    IsSignedIn() {
      return window.accountId ? true : false;
    },
    accountId() {
      return window.accountId;
    },
    contractId() {
      return window.contract ? window.contract.contractId : null;
    },
    balance() {
      return window.accountId
        ? utils.format.formatNearAmount(window.balance.total)
        : null;
    },
    networkId() {
      return window.networkId;
    },
  },
  methods: {
    login: login,
    logout: logout,
  },
};
</script>
