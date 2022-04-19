<template>
  <b-modal
    ref="offerModal"
    ok-title="Offer"
    hide-header
    centered
    cancel-variant="default"
    :ok-disabled="loading"
    @ok="offer"
    @hidden="hidden"
  >
    <b-form-group
      label="Your Offer"
      label-for="input-1"
      :description="`Highest offer is ${highestOffer}`"
    >
      <b-form-input type="number" v-model="amount" required></b-form-input>
    </b-form-group>
  </b-modal>
</template>
<script>
import BN from "bn.js";
import { utils } from "near-api-js";

export default {
  data() {
    return {
      loading: false,
      tokenId: "",
      highestOffer: 0,
      amount: 0,
    };
  },
  methods: {
    show(tokenId, highestOffer) {
      this.highestOffer = highestOffer;
      this.tokenId = tokenId;
      this.amount = Number.parseInt(this.highestOffer) + 1;

      this.$refs.offerModal.show();
    },
    async offer(e) {
      e.preventDefault();
      if (this.amount <= this.highestOffer) {
        this.$bvToast.toast(
          "Your offer should be greater than the highest bid.",
          {
            title: `Offer Bid`,
            variant: "danger",
            solid: true,
          }
        );

        return;
      }

      this.loading = true;
      var success = await window.contract.nft_offer_transfer(
        {
          token_id: this.tokenId,
          bid: `${this.amount}`,
        },
        "300000000000000",
        new BN(utils.format.parseNearAmount(`${this.amount}`))
      );

      console.log(success);
      if (success) {
        this.$bvToast.toast(`You offered ${this.amount} NEAR successfully.`, {
          title: `Offer Bid`,
          variant: "deafult",
          solid: true,
        });
      } else {
        this.$bvToast.toast("You could not offer successfully.", {
          title: `Offer Bid`,
          variant: "danger",
          solid: true,
        });
      }
      this.loading = false;
      this.$refs.offerModal.hide();
    },
    hidden() {
      this.tokenId = "";
      this.amount = 0;
      this.highestOffer = 0;
    },
  },
};
</script>
