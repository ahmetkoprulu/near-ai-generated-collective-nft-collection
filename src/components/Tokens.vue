<template>
  <div>
    <h3 class="text-center mt-5">Minted NFTs</h3>
    <b-tabs class="py-3" align="center" size="m" pills small>
      <b-tab title="My Assets" active>
        <b-overlay
          variant="white"
          :opacity="0.75"
          spinner-variant="secondary"
          :show="loading"
          rounded="sm"
        >
          <div class="row" v-if="myTokens.length > 0">
            <div
              class="col-lg-3 d-flex align-items-stretch px-2 my-2"
              style="padding: 0px"
              v-for="token in myTokens"
              :key="token.token_id"
            >
              <div class="card h-100">
                <img class="card-img-top" :src="token.metadata.media" />
                <div class="card-body">
                  <div class="card-text h-75">
                    <small class="text-muted">{{ token.token_id }}</small>
                    <br />
                    {{ token.owner_id }}
                  </div>
                  <div
                    class="d-flex justify-content-between"
                    v-if="token.highest_bid > 0"
                  >
                    <b-button
                      class="action-button"
                      size="sm"
                      @click="showSellAlert(token)"
                    >
                      Sell
                    </b-button>
                    <small class="text-muted my-auto">
                      {{ token.highest_bid }} N
                    </small>
                  </div>
                  <div class="text-muted d-flex justify-content-end" v-else>
                    <small class="text-muted my-auto">
                      {{ token.highest_bid }} N
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-100 text-center my-5" v-else>
            You do not have any asset.
          </div>
        </b-overlay>
      </b-tab>
      <b-tab title="Collection">
        <b-overlay
          variant="white"
          :opacity="0.75"
          spinner-variant="secondary"
          :show="loading"
          rounded="sm"
        >
          <div class="row" v-if="tokens.length > 0">
            <div
              class="col-lg-3 d-flex align-items-stretch px-2 my-2"
              style="padding: 0px"
              v-for="token in tokens"
              :key="token.token_id"
            >
              <div class="card cont" style="min-height: 420px">
                <img class="card-img-top" :src="token.metadata.media" />
                <div class="card-body">
                  <div class="card-text h-75">
                    <small class="text-muted">{{ token.token_id }}</small>
                    <br />
                    {{ token.owner_id }}
                  </div>
                  <div
                    class="d-flex justify-content-between"
                    v-if="accountId && accountId != token.owner_id"
                  >
                    <b-button
                      class="action-button"
                      size="sm"
                      variant="light"
                      @click="showOfferModal(token)"
                    >
                      Offer
                    </b-button>
                    <small class="text-muted my-auto">
                      {{ token.highest_bid }} N
                    </small>
                  </div>
                  <div class="d-flex justify-content-end" v-else>
                    <small class="text-muted my-auto">
                      {{ token.highest_bid }} N
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-100 text-center my-5" v-else>
            No asset minted yet. Be the first one.
          </div>
        </b-overlay>
      </b-tab>
    </b-tabs>
    <OfferModal ref="offerModal" />
    <SellAlert ref="sellAlert" @sold="onSold" />
  </div>
</template>
<script>
import OfferModal from "./OfferModal.vue";
import SellAlert from "./SellTokenAlert.vue";

export default {
  data() {
    return { loading: false, tokens: [], myTokens: [] };
  },
  mounted() {
    this.loading = true;
    this.fetchMintedTokens();
    this.fetchMyTokens();
    this.loading = false;
  },
  computed: {
    accountId() {
      return window.accountId;
    },
  },
  methods: {
    async fetchMintedTokens() {
      var tokens = await window.contract.nft_tokens({
        from_index: null,
        limit: "0",
      });
      this.tokens = tokens;
    },
    async fetchMyTokens() {
      let accountId = window.accountId;
      var tokens = await window.contract.nft_tokens_for_owner({
        account_id: accountId,
        from_index: null,
        limit: "0",
      });
      console.log(tokens);
      this.myTokens = tokens;
    },
    showOfferModal(token) {
      this.$refs.offerModal.show(token.token_id, token.highest_bid);
    },
    showSellAlert(token) {
      this.$refs.sellAlert.show(token);
    },
    async onSold() {
      this.loading = true;
      this.fetchMintedTokens();
      this.fetchMyTokens();
      this.loading = false;
    },
  },
  components: { OfferModal, SellAlert },
};
</script>
<style scoped>
.action-button {
  visibility: hidden;
}

.card:hover .action-button {
  visibility: visible;
}
</style>
